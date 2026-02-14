from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import uvicorn
import os
import csv
import io
from collections import defaultdict

from app.database import engine, Base, get_db
from app import auth, biometric_processor, models
from sqlalchemy.orm import Session
from sqlalchemy import func

# Initialize Services
from app.config_service import config_service

# Create database tables (Graceful handling)
try:
    Base.metadata.create_all(bind=engine)
    
    # Initialize default configs
    db = Session(bind=engine)
    config_service.initialize_defaults(db)
    db.close()
    print("Database initialized successfully.")
except Exception as e:
    print(f"Warning: Database initialization failed: {e}")
    print("Continuing startup... DB features may be limited until connection is restored.")

app = FastAPI(title="Biometric Attendance System")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5188",
        "https://amit123103.github.io",
        "https://holoattandance.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Middleware
from app.security_middleware import SecurityMiddleware
app.add_middleware(SecurityMiddleware)

# Mount static files for biometric images
# Mount static files for biometric images
os.makedirs("biometric_storage/eye_scans", exist_ok=True)
os.makedirs("biometric_storage/thumb_scans", exist_ok=True)
app.mount("/biometric_storage", StaticFiles(directory="biometric_storage"), name="biometric_storage")

# Request/Response Models
class RegistrationRequest(BaseModel):
    name: str
    registration_number: str
    eye_image: str  # base64 encoded
    thumb_image: str  # base64 encoded

class VerificationRequest(BaseModel):
    eye_image: str  # base64 encoded
    thumb_image: str  # base64 encoded

class LoginRequest(BaseModel):
    username: str
    password: str

# Routes
# ... (Previous imports)
from app.mail_service import EmailService
from app.report_generator import ReportGenerator
from fastapi.responses import StreamingResponse

# Initialize Services
email_service = EmailService()
report_generator = ReportGenerator()
from app.sse_service import sse_service
from fastapi.responses import StreamingResponse
import asyncio

# SSE Stream Endpoint
@app.get("/api/stream")
async def stream_events(request: Request):
    return StreamingResponse(
        sse_service.subscribe(request),
        media_type="text/event-stream"
    )

# ... (Existing routes)

# --- Reporting & Communication Routes ---

@app.post("/api/notify/student/{student_id}")
async def notify_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get latest attendance
    latest_record = db.query(models.Attendance)\
        .filter(models.Attendance.student_id == student_id)\
        .order_by(models.Attendance.timestamp.desc())\
        .first()
        
    if not latest_record:
         raise HTTPException(status_code=400, detail="No attendance records found")

    time_str = latest_record.timestamp.strftime("%I:%M %p, %d %b %Y")
    success = await email_service.send_attendance_confirmation(
        student.email, 
        student.name, 
        time_str, 
        latest_record.verification_status.upper()
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
        
    return {"message": "Notification sent successfully"}

@app.get("/api/reports/student/{student_id}/pdf")
async def generate_student_pdf(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    records = db.query(models.Attendance)\
        .filter(models.Attendance.student_id == student_id)\
        .order_by(models.Attendance.timestamp.desc())\
        .all()
        
    pdf_buffer = report_generator.generate_student_report(student.name, student.registration_number, records)
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{student.registration_number}.pdf"}
    )


# Rate Limiter
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

# Use Redis for rate limiting if available, otherwise fallback to memory
redis_url = os.getenv("REDIS_URL", "memory://")
limiter = Limiter(key_func=get_remote_address, storage_uri=redis_url)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Cache Service
from app.cache_service import cache_service

# Liveness Service
from app.liveness_service import LivenessService
liveness_service = LivenessService()
import random

# ... (Previous routes)

# --- Liveness Detection Routes ---

@app.get("/api/liveness/challenge")
@limiter.limit("10/minute")
def get_liveness_challenge(request: Request):
    """
    Returns a random challenge for the user to perform.
    """
    challenges = ["LOOK_LEFT", "LOOK_RIGHT", "CENTER"]
    challenge = random.choice(challenges)
    return {"challenge": challenge}

class LivenessRequest(BaseModel):
    image: str
    challenge: str

@app.post("/api/liveness/verify")
@limiter.limit("20/minute")
async def verify_liveness_action(request: Request, payload: LivenessRequest):
    """
    Verifies if the submitted image matches the requested challenge.
    """
    result = liveness_service.verify_liveness(payload.image, payload.challenge)
    return result

# Serve static files if built
if os.path.exists("static/index.html"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("biometric_storage/"):
            raise HTTPException(status_code=404, detail="Not found")
        return FileResponse("static/index.html")
else:
    @app.get("/")
    def read_root():
        return {"message": "Biometric Attendance API is running. (Static files not found)", "status": "running"}

@app.post("/api/register")
async def register_student(request: RegistrationRequest, db: Session = Depends(get_db)):
    """Register a new student with biometric data"""
    try:
        result = await biometric_processor.register_student(
            db=db,
            name=request.name,
            reg_no=request.registration_number,
            eye_image_b64=request.eye_image,
            thumb_image_b64=request.thumb_image
        )
        return {"success": True, "student_id": result["student_id"], "message": "Registration successful"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/verify")
async def verify_attendance(request: VerificationRequest, db: Session = Depends(get_db)):
    """Verify student identity and mark attendance"""
    try:
        result = await biometric_processor.verify_student(
            db=db,
            eye_image_b64=request.eye_image,
            thumb_image_b64=request.thumb_image
        )
        
        if result["matched"]:
            # Broadcast Attendance Event
            asyncio.create_task(sse_service.broadcast("attendance_update", {
                "student_name": result["student"].name,
                "registration_number": result["student"].registration_number,
                "status": "success",
                "time": datetime.now().strftime("%H:%M:%S")
            }))

            return {
                "success": True,
                "student": {
                    "name": result["student"].name,
                    "registration_number": result["student"].registration_number
                },
                "message": "Attendance marked successfully"
            }
        else:
            return {"success": False, "message": "Student not found or biometric mismatch"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/admin/login")
def admin_login(request: LoginRequest, db: Session = Depends(get_db)):
    """Admin login"""
    try:
        tokens = auth.authenticate_admin(db, request.username, request.password)
        return {"success": True, **tokens}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

class RefreshRequest(BaseModel):
    refresh_token: str

@app.post("/api/auth/refresh")
def refresh_token(request: RefreshRequest):
    """Refresh access token"""
    try:
        username = auth.verify_refresh_token(request.refresh_token)
        new_access_token = auth.create_access_token(data={"sub": username})
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@app.get("/api/admin/students")
def get_students(db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    """Get all registered students (admin only)"""
    students = db.query(models.Student).all()
    return {
        "students": [
            {
                "id": s.id,
                "name": s.name,
                "registration_number": s.registration_number,
                "created_at": s.created_at.isoformat(),
                "eye_image_path": s.eye_image_path,
                "thumb_image_path": s.thumb_image_path
            }
            for s in students
        ]
    }

@app.get("/api/admin/attendance")
def get_attendance(db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    """Get attendance records (admin only)"""
    records = db.query(models.Attendance).join(models.Student).all()
    return {
        "attendance": [
            {
                "id": r.id,
                "student_name": r.student.name,
                "registration_number": r.student.registration_number,
                "timestamp": r.timestamp.isoformat(),
                "verification_status": r.verification_status,
                "eye_match_score": r.eye_match_score,
                "thumb_match_score": r.thumb_match_score
            }
            for r in records
        ]
    }

@app.get("/api/admin/attendance/export")
def export_attendance(db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    """Export attendance to Excel (admin only)"""
    try:
        import pandas as pd
        from io import BytesIO
        from fastapi.responses import StreamingResponse
        
        records = db.query(models.Attendance).join(models.Student).all()
        data = [
            {
                "Student Name": r.student.name,
                "Registration Number": r.student.registration_number,
                "Date & Time": r.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "Status": r.verification_status,
                "Eye Match Score": f"{r.eye_match_score:.2f}" if r.eye_match_score else "N/A",
                "Thumb Match Score": f"{r.thumb_match_score:.2f}" if r.thumb_match_score else "N/A"
            }
            for r in records
        ]
        
        df = pd.DataFrame(data)
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Attendance')
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=attendance.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/students/upload")
async def upload_students_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    """Upload students from CSV file (admin only)"""
    try:
        # Read CSV file
        contents = await file.read()
        decoded = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded))
        
        imported_count = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Validate required fields
                if not row.get('name') or not row.get('registration_number'):
                    errors.append(f"Row {row_num}: Missing name or registration_number")
                    continue
                
                # Check if student already exists
                existing = db.query(models.Student).filter(
                    models.Student.registration_number == row['registration_number']
                ).first()
                
                if existing:
                    errors.append(f"Row {row_num}: Student {row['registration_number']} already exists")
                    continue
                
                # Create student record (without biometric data)
                student = models.Student(
                    name=row['name'],
                    registration_number=row['registration_number'],
                    eye_template=b'',  # Empty bytes - will be filled during registration
                    thumb_template=b'',
                    eye_image_path='',
                    thumb_image_path=''
                )
                
                db.add(student)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Successfully imported {imported_count} students",
            "imported": imported_count,
            "errors": errors if errors else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV processing failed: {str(e)}")

# Analytics Endpoints
@app.get("/api/admin/analytics/overview")
@cache_service.cache_response(ttl=60)
def get_analytics_overview(db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    """Get overall analytics overview (admin only)"""
    try:
        # Total students
        total_students = db.query(models.Student).count()
        
        # Today's attendance
        today = datetime.now().date()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        
        attendance_today = db.query(models.Attendance).filter(
            models.Attendance.timestamp >= today_start,
            models.Attendance.timestamp <= today_end,
            models.Attendance.verification_status == 'success'
        ).count()
        
        # This week's attendance
        week_start = today - timedelta(days=today.weekday())
        week_start_dt = datetime.combine(week_start, datetime.min.time())
        
        attendance_week = db.query(models.Attendance).filter(
            models.Attendance.timestamp >= week_start_dt,
            models.Attendance.verification_status == 'success'
        ).count()
        
        # This month's attendance
        month_start = today.replace(day=1)
        month_start_dt = datetime.combine(month_start, datetime.min.time())
        
        attendance_month = db.query(models.Attendance).filter(
            models.Attendance.timestamp >= month_start_dt,
            models.Attendance.verification_status == 'success'
        ).count()
        
        # Calculate attendance rate
        attendance_rate = (attendance_today / total_students * 100) if total_students > 0 else 0
        
        return {
            "total_students": total_students,
            "attendance_today": attendance_today,
            "attendance_rate_today": round(attendance_rate, 1),
            "attendance_week": attendance_week,
            "attendance_month": attendance_month
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/analytics/attendance-trend")
@cache_service.cache_response(ttl=300)
def get_attendance_trend(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    """Get attendance trend for the last N days (admin only)"""
    try:
        today = datetime.now().date()
        trend_data = []
        labels = []
        
        for i in range(days - 1, -1, -1):
            date = today - timedelta(days=i)
            date_start = datetime.combine(date, datetime.min.time())
            date_end = datetime.combine(date, datetime.max.time())
            
            count = db.query(models.Attendance).filter(
                models.Attendance.timestamp >= date_start,
                models.Attendance.timestamp <= date_end,
                models.Attendance.verification_status == 'success'
            ).count()
            
            trend_data.append(count)
            labels.append(date.strftime("%a %d"))
        
        return {
            "labels": labels,
            "data": trend_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# System Monitor
from app.system_monitor import SystemMonitor
system_monitor = SystemMonitor()

@app.get("/api/admin/system/stats")
def get_system_stats(current_user: dict = Depends(auth.get_current_user)):
    """Get real-time system telemetry"""
    return system_monitor.get_system_stats()

@app.get("/api/admin/system/backup")
def download_backup(db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    """Dump database to JSON"""
    try:
        # Fetch all data
        students = db.query(models.Student).all()
        attendance = db.query(models.Attendance).all()
        logs = db.query(models.AuditLog).all()
        
        backup_data = {
            "generated_at": datetime.now().isoformat(),
            "students": [
                {
                    "id": s.id, 
                    "name": s.name, 
                    "reg_no": s.registration_number,
                    "created_at": s.created_at.isoformat()
                } for s in students
            ],
            "attendance": [
                {
                    "student_id": a.student_id,
                    "timestamp": a.timestamp.isoformat(),
                    "status": a.verification_status,
                    "score": a.eye_match_score
                } for a in attendance
            ],
            "audit_logs": [
                {
                    "timestamp": l.timestamp.isoformat(),
                    "action": l.action_type,
                    "actor": l.actor_id,
                    "details": l.details
                } for l in logs
            ]
        }
        
        import json
        output = io.StringIO()
        json.dump(backup_data, output, indent=4)
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=backup_{datetime.now().strftime('%Y%m%d')}.json"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")

# ... (Previous analytics imports)
@app.get("/api/admin/analytics/hourly-distribution")
def get_hourly_distribution(db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    """Get hourly attendance distribution (admin only)"""
    try:
        # Get all attendance records
        records = db.query(models.Attendance).filter(
            models.Attendance.verification_status == 'success'
        ).all()
        
        # Group by hour
        hourly_counts = defaultdict(int)
        for record in records:
            hour = record.timestamp.hour
            hourly_counts[hour] += 1
        
        # Create labels and data for all hours (0-23)
        labels = [f"{h:02d}:00" for h in range(24)]
        data = [hourly_counts.get(h, 0) for h in range(24)]
        
        return {
            "labels": labels,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- O&M Routes ---

@app.get("/api/admin/config")
@cache_service.cache_response(ttl=120)
def get_system_config(db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    """Get all system configurations"""
    return config_service.get_all_configs(db)

class ConfigUpdate(BaseModel):
    key: str
    value: str

@app.put("/api/admin/config")
def update_system_config(config: ConfigUpdate, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    """Update system configuration"""
    updated = config_service.update_config(db, config.key, config.value)
    if not updated:
        raise HTTPException(status_code=404, detail="Config key not found")
    return {"success": True, "message": "Configuration updated"}

@app.get("/api/admin/logs")
def get_system_logs(lines: int = 100, current_user: dict = Depends(auth.get_current_user)):
    """Get recent server logs"""
    log_file = "backend.log"
    if not os.path.exists(log_file):
        return {"logs": []}
    
    try:
        with open(log_file, "r") as f:
            # Efficiently read last N lines
            all_lines = f.readlines()
            recent_logs = all_lines[-lines:]
            return {"logs": [line.strip() for line in recent_logs]}
    except Exception as e:
        return {"logs": [f"Error reading logs: {str(e)}"]}

if __name__ == "__main__":
    # Configure logging
    import logging
    logging.basicConfig(
        filename="backend.log",
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s"
    )
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
