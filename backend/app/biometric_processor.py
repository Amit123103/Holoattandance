from sqlalchemy.orm import Session
from app.models import Student, Attendance
from app.biometric_extractor import BiometricExtractor
from app.encryption import BiometricEncryption
import cv2
import json
import os
from datetime import datetime
from typing import Dict

from app.config_service import config_service

# Initialize extractors
extractor = BiometricExtractor()
encryptor = BiometricEncryption()

async def register_student(
    db: Session,
    name: str,
    reg_no: str,
    eye_image_b64: str,
    thumb_image_b64: str
) -> Dict:
    """Register a new student with biometric data"""
    
    # Check if student already exists
    existing = db.query(Student).filter(Student.registration_number == reg_no).first()
    if existing:
        raise ValueError(f"Student with registration number {reg_no} already exists")
    
    # Convert base64 to images
    eye_image = extractor.base64_to_image(eye_image_b64)
    thumb_image = extractor.base64_to_image(thumb_image_b64)
    
    # Extract features
    eye_features = extractor.extract_eye_features(eye_image)
    thumb_features = extractor.extract_fingerprint_features(thumb_image)
    
    # Encrypt templates
    eye_template_json = json.dumps(eye_features)
    thumb_template_json = json.dumps(thumb_features)
    
    encrypted_eye = encryptor.encrypt_template(eye_template_json.encode())
    encrypted_thumb = encryptor.encrypt_template(thumb_template_json.encode())
    
    # Save images
    os.makedirs("biometric_storage/eye_scans", exist_ok=True)
    os.makedirs("biometric_storage/thumb_scans", exist_ok=True)
    
    eye_filename = f"{reg_no}_{name.replace(' ', '_')}_eye.jpg"
    thumb_filename = f"{reg_no}_{name.replace(' ', '_')}_thumb.jpg"
    
    eye_path = f"biometric_storage/eye_scans/{eye_filename}"
    thumb_path = f"biometric_storage/thumb_scans/{thumb_filename}"
    
    cv2.imwrite(eye_path, eye_image)
    cv2.imwrite(thumb_path, thumb_image)
    
    # Create student record
    student = Student(
        name=name,
        registration_number=reg_no,
        eye_template=encrypted_eye,
        thumb_template=encrypted_thumb,
        eye_image_path=f"/biometric_storage/eye_scans/{eye_filename}",
        thumb_image_path=f"/biometric_storage/thumb_scans/{thumb_filename}",
        eye_landmarks=eye_features.get("left_eye_landmarks"),
        thumb_minutiae=thumb_features.get("minutiae_points")
    )
    
    db.add(student)
    db.commit()
    db.refresh(student)
    
    return {"student_id": student.id, "message": "Registration successful"}


async def verify_student(
    db: Session,
    eye_image_b64: str,
    thumb_image_b64: str
) -> Dict:
    """Verify student identity using dual biometric authentication"""
    
    # Convert base64 to images
    eye_image = extractor.base64_to_image(eye_image_b64)
    thumb_image = extractor.base64_to_image(thumb_image_b64)
    
    # Extract features from captured images
    try:
        captured_eye_features = extractor.extract_eye_features(eye_image)
        captured_thumb_features = extractor.extract_fingerprint_features(thumb_image)
    except Exception as e:
        # Fallback/Log the error but don't crash
        print(f"Feature extraction warning: {str(e)}")
        # If eye fails (e.g. no face), we can try to rely on fingerprint or fail
        return {
            "matched": False,
            "message": f"Biometric extraction failed: {str(e)}"
        }
    
    # Get all students
    students = db.query(Student).all()
    
    best_match = None
    best_eye_score = 0.0
    best_thumb_score = 0.0
    best_total_score = 0.0
    
    # Compare with each student
    for student in students:
        try:
            # Decrypt templates
            eye_template_json = encryptor.decrypt_template(student.eye_template).decode()
            thumb_template_json = encryptor.decrypt_template(student.thumb_template).decode()
            
            stored_eye_features = json.loads(eye_template_json)
            stored_thumb_features = json.loads(thumb_template_json)
            
            # Calculate similarity scores
            eye_score = extractor.compare_eye_features(captured_eye_features, stored_eye_features)
            thumb_score = extractor.compare_fingerprint_features(captured_thumb_features, stored_thumb_features)
            
            # Weighted Total Score (Eye is more reliable with MediaPipe)
            # Eye: 60%, Thumb: 40%
            total_score = (eye_score * 0.6) + (thumb_score * 0.4)
            
            if total_score > best_total_score:
                best_total_score = total_score
                best_match = student
                best_eye_score = eye_score
                best_thumb_score = thumb_score
                
        except Exception as e:
            print(f"Error comparing student {student.id}: {e}")
            continue

    # Determination Logic
    # Get dynamic thresholds
    eye_threshold = config_service.get_float(db, "MIN_MATCH_SCORE")
    # Thumb usually slightly lower or same, we can define a separate config or use same
    # For now, let's assume one main threshold for match quality, or separate if defined
    # Let's check if we have specific ones, else use default logic
    
    # We will use the config value as the base
    base_threshold = eye_threshold # e.g. 0.6
    
    # Strict thresholds for individual biometrics (derived from base)
    # Eye is primary, so it should meet the base
    # Thumb can be slightly lower
    
    is_match = (
        best_eye_score >= base_threshold and 
        best_thumb_score >= (base_threshold - 0.05)
    )
    
    # Adaptive threshold: if one is VERY high, allow slightly lower on other
    if not is_match:
        if best_eye_score > 0.90 and best_thumb_score > 0.60:
            is_match = True
        elif best_thumb_score > 0.90 and best_eye_score > 0.65:
            is_match = True

    # Record attendance
    if is_match and best_match:
        attendance = Attendance(
            student_id=best_match.id,
            eye_match_score=best_eye_score,
            thumb_match_score=best_thumb_score,
            verification_status="success",
            verification_method="dual_biometric"
        )
        db.add(attendance)
        db.commit()
        
        return {
            "matched": True,
            "student": best_match,
            "eye_score": round(best_eye_score * 100, 1),
            "thumb_score": round(best_thumb_score * 100, 1),
            "confidence": "High" if best_total_score > 0.85 else "Medium"
        }
    else:
        # Record failed attempt (only if some score was relevant)
        if best_total_score > 0.4:
            attendance = Attendance(
                student_id=best_match.id if best_match else None,
                eye_match_score=best_eye_score,
                thumb_match_score=best_thumb_score,
                verification_status="failed",
                verification_method="dual_biometric"
            )
            db.add(attendance)
            db.commit()
        
        return {
            "matched": False,
            "message": "Identity verification failed. Please try again.",
            "eye_score": round(best_eye_score * 100, 1),
            "thumb_score": round(best_thumb_score * 100, 1)
        }
