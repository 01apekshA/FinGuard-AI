import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.config.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False)  # deposit, withdrawal, transfer_in, transfer_out, payment
    category = Column(String, default="other", nullable=False)  # food, transport, salary, etc.
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD", nullable=False)
    description = Column(String, nullable=True)
    counterparty = Column(String, nullable=True)  # name of beneficiary or merchant
    counterparty_account = Column(String, nullable=True)
    status = Column(String, default="completed", nullable=False)  # pending, completed, failed, flagged
    risk_score = Column(Float, default=0.0, nullable=False)
    is_flagged = Column(String, default="no", nullable=False)  # yes/no for fraud
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    user = relationship("User", back_populates="transactions")
