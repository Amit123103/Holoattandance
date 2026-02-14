from sqlalchemy.orm import Session
from app.models import SystemConfig
from typing import Dict, Any

DEFAULT_CONFIGS = {
    "MIN_MATCH_SCORE": {"value": "0.6", "description": "Minimum score (0-1) for biometric match"},
    "LIVENESS_THRESHOLD": {"value": "0.7", "description": "Threshold (0-1) for liveness confidence"},
    "REGISTRATION_ENABLED": {"value": "true", "description": "Enable/Disable new student registration"},
    "MAINTENANCE_MODE": {"value": "false", "description": "Enable maintenance mode (only admins can access)"}
}

class ConfigService:
    def __init__(self):
        pass

    def initialize_defaults(self, db: Session):
        """Initialize default configuration if not exists"""
        for key, default in DEFAULT_CONFIGS.items():
            config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
            if not config:
                config = SystemConfig(
                    key=key,
                    value=default["value"],
                    description=default["description"]
                )
                db.add(config)
        db.commit()

    def get_config(self, db: Session, key: str) -> str:
        """Get configuration value"""
        config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        if config:
            return config.value
        return DEFAULT_CONFIGS.get(key, {}).get("value")

    def get_all_configs(self, db: Session) -> Dict[str, Any]:
        """Get all configurations"""
        configs = db.query(SystemConfig).all()
        return {
            c.key: {
                "value": c.value,
                "description": c.description,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None
            }
            for c in configs
        }

    def update_config(self, db: Session, key: str, value: str):
        """Update configuration value"""
        config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        if config:
            config.value = str(value)
            db.commit()
            db.refresh(config)
            return config
        return None

    def get_float(self, db: Session, key: str) -> float:
        """Helper to get float config"""
        val = self.get_config(db, key)
        try:
            return float(val)
        except:
            return float(DEFAULT_CONFIGS.get(key, {}).get("value", 0.0))

    def get_bool(self, db: Session, key: str) -> bool:
        """Helper to get boolean config"""
        val = self.get_config(db, key)
        return val.lower() == "true"

config_service = ConfigService()
