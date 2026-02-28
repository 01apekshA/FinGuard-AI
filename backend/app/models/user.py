import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.config.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)

    email = Column(String, unique=True, nullable=False, index=True)

    full_name = Column(String, nullable=False)

    hashed_password = Column(String, nullable=True)

    role = Column(String, default="user", nullable=False)

    kyc_status = Column(
        String,
        default="pending",
        nullable=False
    )

    picture = Column(String, nullable=True)

    phone = Column(String, nullable=True)

    is_active = Column(
        Boolean,
        default=True,
        nullable=False
    )

    auth_provider = Column(
        String,
        default="local",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=_utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=_utcnow,
        onupdate=_utcnow,
        nullable=False
    )

    wallet = relationship(
        "Wallet",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    transactions = relationship(
        "Transaction",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    beneficiaries = relationship(
        "Beneficiary",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    fraud_alerts = relationship(
        "FraudAlert",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    ai_insights = relationship(
        "AIInsight",
        back_populates="user",
        cascade="all, delete-orphan"
    )