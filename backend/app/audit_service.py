from sqlalchemy.orm import Session
from app.models import AuditLog
from datetime import datetime
import asyncio
from app.sse_service import sse_service
from fastapi import Request

class AuditService:
    def log_event(self, db: Session, action_type: str, actor_id: str, resource: str, details: dict = None, request: Request = None):
        """
        Logs a system event to the database.
        """
        ip_address = "Unknown"
        if request:
             ip_address = request.client.host
             
        # Add user agent if available
        if request and details is None:
             details = {}
        
        if request:
            details["user_agent"] = request.headers.get("user-agent")

        audit_entry = AuditLog(
            action_type=action_type,
            actor_id=actor_id,
            resource=resource,
            details=details or {},
            ip_address=ip_address
        )
        
        # Broadcast real-time event
        description = f"Action: {action_type} by {actor_id}"
        if resource:
             description += f" on {resource}"
             
        asyncio.create_task(sse_service.broadcast("audit_log", {
            "event_type": action_type,
            "description": description,
            "severity": "info",
            "timestamp": datetime.utcnow().isoformat()
        }))
        
        try:
            db.add(audit_entry)
            db.commit()
            db.refresh(audit_entry)
            return audit_entry
        except Exception as e:
            print(f"Audit Log Error: {e}")
            db.rollback()
            return None

    def get_logs(self, db: Session, limit: int = 50):
        return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
