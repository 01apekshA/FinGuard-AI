import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from app.config.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True, index=True)
    actor_email = Column(String, nullable=True)
    action = Column(String, nullable=False)  # login, register, transfer, kyc_approved...
    detail = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
