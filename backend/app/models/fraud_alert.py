import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.config.database import Base


class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    transaction_id = Column(String, nullable=True)
    severity = Column(String, default="medium", nullable=False)  # low, medium, high
    reason = Column(Text, nullable=False)
    risk_score = Column(Float, default=0.0, nullable=False)
    status = Column(String, default="open", nullable=False)  # open, resolved, dismissed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    user = relationship("User", back_populates="fraud_alerts")
