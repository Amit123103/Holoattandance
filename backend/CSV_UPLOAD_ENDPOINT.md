# Backend endpoint for CSV upload

from fastapi import UploadFile
import csv
import io

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
                    # Biometric fields will be null until they register via webcam
                    eye_template=None,
                    thumb_template=None,
                    eye_image_path=None,
                    thumb_image_path=None
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
