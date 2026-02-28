from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ------------------ AUTH ------------------
class RegisterIn(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    full_name: str
    role: str
    kyc_status: str
    picture: Optional[str] = None
    phone: Optional[str] = None
    auth_provider: str
    is_active: bool
    created_at: datetime


# ------------------ WALLET ------------------
class WalletOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    balance: float
    savings: float
    currency: str
    credit_score: float


class DepositIn(BaseModel):
    amount: float = Field(gt=0)
    note: Optional[str] = None


class TransferIn(BaseModel):
    beneficiary_id: Optional[str] = None
    counterparty_name: Optional[str] = None
    counterparty_account: Optional[str] = None
    amount: float = Field(gt=0)
    category: str = "other"
    note: Optional[str] = None


# ------------------ TRANSACTION ------------------
class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    type: str
    category: str
    amount: float
    currency: str
    description: Optional[str] = None
    counterparty: Optional[str] = None
    counterparty_account: Optional[str] = None
    status: str
    risk_score: float
    is_flagged: str
    created_at: datetime


# ------------------ BENEFICIARY ------------------
class BeneficiaryIn(BaseModel):
    name: str
    account_number: str
    bank_name: Optional[str] = None
    nickname: Optional[str] = None
    avatar_color: Optional[str] = "#10B981"


class BeneficiaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    account_number: str
    bank_name: Optional[str] = None
    nickname: Optional[str] = None
    avatar_color: str
    created_at: datetime


# ------------------ AI ------------------
class AIInsightOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    agent: str
    title: str
    summary: str
    score: Optional[float] = None
    created_at: datetime


class AIChatIn(BaseModel):
    message: str
    session_id: Optional[str] = None


class AIChatOut(BaseModel):
    response: str
    session_id: str


# ------------------ FRAUD ------------------
class FraudAlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    transaction_id: Optional[str] = None
    severity: str
    reason: str
    risk_score: float
    status: str
    created_at: datetime


# ------------------ ADMIN ------------------
class AdminUserOut(UserOut):
    wallet_balance: Optional[float] = None
    transaction_count: Optional[int] = None


class KYCUpdateIn(BaseModel):
    status: str  # approved | rejected | pending


class ActivityLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: Optional[str] = None
    actor_email: Optional[str] = None
    action: str
    detail: Optional[str] = None
    created_at: datetime


# ------------------ ANALYTICS ------------------
class CashflowPoint(BaseModel):
    label: str
    income: float
    expense: float


class CategorySlice(BaseModel):
    category: str
    amount: float


class SpendingTrendPoint(BaseModel):
    date: str
    amount: float


# ------------------ OAUTH ------------------
class OAuthSessionIn(BaseModel):
    session_id: str


TokenOut.model_rebuild()
