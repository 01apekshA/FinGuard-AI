import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.config.database import Base


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    agent = Column(String, nullable=False)  # fraud | financial_health | spending_prediction | budget_advisor | risk_scoring
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    score = Column(Float, nullable=True)
    metadata_json = Column(Text, nullable=True)  # JSON string for extra structured info
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    user = relationship("User", back_populates="ai_insights")
