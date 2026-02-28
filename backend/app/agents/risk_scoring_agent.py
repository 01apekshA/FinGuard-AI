"""Aggregate user risk score from fraud alerts, transaction patterns, balance."""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models import Transaction, FraudAlert, Wallet


def compute_risk(db: Session, user_id: str) -> dict:
    since = datetime.now(timezone.utc) - timedelta(days=30)

    alerts = (
        db.query(FraudAlert)
        .filter(FraudAlert.user_id == user_id, FraudAlert.created_at >= since)
        .all()
    )
    high = sum(1 for a in alerts if a.severity == "high")
    med = sum(1 for a in alerts if a.severity == "medium")
    low = sum(1 for a in alerts if a.severity == "low")

    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id, Transaction.created_at >= since)
        .all()
    )
    expense = sum(t.amount for t in txs if t.type in ("transfer_out", "payment", "withdrawal"))
    income = sum(t.amount for t in txs if t.type in ("deposit", "transfer_in"))

    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    balance = wallet.balance if wallet else 0.0

    score = 0.0
    score += high * 25 + med * 12 + low * 4
    if income > 0 and expense > income * 1.2:
        score += 20  # overspending
    if balance < 100:
        score += 15
    score = min(score, 100.0)

    level = "low"
    if score >= 60:
        level = "high"
    elif score >= 30:
        level = "medium"

    return {
        "score": round(score, 1),
        "level": level,
        "alerts_high": high,
        "alerts_medium": med,
        "alerts_low": low,
        "factors": {
            "alerts_30d": len(alerts),
            "expense_30d": round(expense, 2),
            "income_30d": round(income, 2),
            "balance": round(balance, 2),
        },
    }
