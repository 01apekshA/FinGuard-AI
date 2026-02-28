from datetime import datetime, timedelta, timezone
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models import User, Transaction
from app.utils.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


@router.get("/cashflow")
def cashflow(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    months: int = 6,
):
    """Monthly income vs expense for the last N months."""
    now = datetime.now(timezone.utc)
    start = (now.replace(day=1) - timedelta(days=30 * (months - 1))).replace(day=1)
    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id, Transaction.created_at >= start)
        .all()
    )

    buckets = defaultdict(lambda: {"income": 0.0, "expense": 0.0})
    for t in txs:
        key = (t.created_at.year, t.created_at.month)
        if t.type in ("deposit", "transfer_in"):
            buckets[key]["income"] += t.amount
        elif t.type in ("transfer_out", "payment", "withdrawal"):
            buckets[key]["expense"] += t.amount

    series = []
    cursor = start
    while cursor <= now:
        key = (cursor.year, cursor.month)
        b = buckets.get(key, {"income": 0.0, "expense": 0.0})
        series.append(
            {
                "label": MONTH_LABELS[cursor.month - 1],
                "income": round(b["income"], 2),
                "expense": round(b["expense"], 2),
            }
        )
        # next month
        year, month = cursor.year, cursor.month + 1
        if month > 12:
            month = 1
            year += 1
        cursor = cursor.replace(year=year, month=month, day=1)

    return {"series": series}


@router.get("/expense-breakdown")
def expense_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = 30,
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    txs = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.created_at >= since,
            Transaction.type.in_(["transfer_out", "payment", "withdrawal"]),
        )
        .all()
    )
    cat = defaultdict(float)
    for t in txs:
        cat[t.category] += t.amount
    breakdown = [{"category": k, "amount": round(v, 2)} for k, v in cat.items()]
    breakdown.sort(key=lambda x: x["amount"], reverse=True)
    return {"breakdown": breakdown, "total": round(sum(cat.values()), 2)}


@router.get("/spending-trend")
def spending_trend(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = 14,
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    txs = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.created_at >= since,
            Transaction.type.in_(["transfer_out", "payment", "withdrawal"]),
        )
        .all()
    )
    daily = defaultdict(float)
    for t in txs:
        key = t.created_at.strftime("%b %d")
        daily[key] += t.amount
    # produce continuous list
    points = []
    cur = since
    end = datetime.now(timezone.utc)
    while cur <= end:
        k = cur.strftime("%b %d")
        points.append({"date": k, "amount": round(daily.get(k, 0.0), 2)})
        cur += timedelta(days=1)
    return {"points": points}


@router.get("/summary")
def summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Aggregate income/expense/savings KPIs (last 30 days)."""
    since = datetime.now(timezone.utc) - timedelta(days=30)
    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id, Transaction.created_at >= since)
        .all()
    )
    income = sum(t.amount for t in txs if t.type in ("deposit", "transfer_in"))
    expense = sum(t.amount for t in txs if t.type in ("transfer_out", "payment", "withdrawal"))
    savings = max(0.0, income - expense)
    return {
        "income": round(income, 2),
        "expense": round(expense, 2),
        "savings": round(savings, 2),
        "tx_count": len(txs),
    }
