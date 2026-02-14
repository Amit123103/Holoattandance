from sqlalchemy import Column, Integer, String, LargeBinary, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    registration_number = Column(String, unique=True, nullable=False, index=True)
    
    # Encrypted biometric templates
    eye_template = Column(LargeBinary, nullable=False)
    thumb_template = Column(LargeBinary, nullable=False)
    
    # Image paths
    eye_image_path = Column(String)
    thumb_image_path = Column(String)
    
    # Biometric feature data (JSON)
    eye_landmarks = Column(JSON)
    thumb_minutiae = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    attendance_records = relationship("Attendance", back_populates="student")


class Attendance(Base):
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    eye_match_score = Column(Float)
    thumb_match_score = Column(Float)
    verification_status = Column(String)  # 'success' or 'failed'
    verification_method = Column(String, default="dual_biometric")
    
    # Relationship
    student = relationship("Student", back_populates="attendance_records")


class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemConfig(Base):
    __tablename__ = "system_configs"
    
    key = Column(String, primary_key=True, index=True)
    value = Column(String, nullable=False)
    description = Column(String)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    action_type = Column(String, nullable=False, index=True)
    actor_id = Column(String)
    resource = Column(String)
    ip_address = Column(String)
    details = Column(JSON)
    status = Column(String)
