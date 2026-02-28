"""Calculate financial health score based on income/expense/savings ratios."""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models import Transaction, Wallet


def compute_health(db: Session, user_id: str) -> dict:
    since = datetime.now(timezone.utc) - timedelta(days=30)
    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id, Transaction.created_at >= since)
        .all()
    )
    income = sum(t.amount for t in txs if t.type in ("deposit", "transfer_in"))
    expense = sum(t.amount for t in txs if t.type in ("transfer_out", "payment", "withdrawal"))

    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    balance = wallet.balance if wallet else 0.0
    savings = wallet.savings if wallet else 0.0

    if income > 0:
        savings_ratio = max(0.0, (income - expense)) / income
        expense_ratio = min(expense / income, 2.0)
    else:
        savings_ratio = 0.0
        expense_ratio = 1.0 if expense > 0 else 0.0

    # Score: 50% savings ratio, 30% balance buffer, 20% expense control
    score = 0.0
    score += min(savings_ratio, 0.5) * 100  # up to 50
    score += min(balance / 5000.0, 1.0) * 30  # up to 30
    score += max(0.0, 1.0 - min(expense_ratio, 1.0)) * 20  # up to 20
    score = round(min(score, 100.0), 1)

    rating = "Poor"
    if score >= 80:
        rating = "Excellent"
    elif score >= 65:
        rating = "Good"
    elif score >= 45:
        rating = "Fair"

    return {
        "score": score,
        "rating": rating,
        "income_30d": round(income, 2),
        "expense_30d": round(expense, 2),
        "savings_ratio": round(savings_ratio, 3),
        "expense_ratio": round(expense_ratio, 3),
        "balance": round(balance, 2),
        "savings": round(savings, 2),
    }
