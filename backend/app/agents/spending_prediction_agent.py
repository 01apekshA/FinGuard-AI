"""Predict next-month spending using simple moving-average / linear trend."""
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models import Transaction


def predict_next_month(db: Session, user_id: str) -> dict:
    since = datetime.now(timezone.utc) - timedelta(days=90)
    txs = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.created_at >= since,
            Transaction.type.in_(["transfer_out", "payment", "withdrawal"]),
        )
        .all()
    )

    # Group by month
    monthly = defaultdict(float)
    category_monthly = defaultdict(lambda: defaultdict(float))
    for t in txs:
        key = t.created_at.strftime("%Y-%m")
        monthly[key] += t.amount
        category_monthly[t.category][key] += t.amount

    months_sorted = sorted(monthly.keys())
    if not months_sorted:
        return {"predicted_total": 0.0, "by_category": [], "trend": "flat"}

    totals = [monthly[m] for m in months_sorted]
    avg = sum(totals) / len(totals)

    # Simple trend: compare last vs avg
    last = totals[-1]
    trend = "flat"
    if last > avg * 1.1:
        trend = "rising"
    elif last < avg * 0.9:
        trend = "falling"

    # Predict: weight last month higher
    predicted = round((avg + last) / 2, 2)

    # By-category predictions
    cat_preds = []
    for cat, by_month in category_monthly.items():
        vals = list(by_month.values())
        if vals:
            cat_preds.append({"category": cat, "predicted": round(sum(vals) / len(vals), 2)})

    cat_preds.sort(key=lambda x: x["predicted"], reverse=True)

    return {
        "predicted_total": predicted,
        "by_category": cat_preds[:6],
        "trend": trend,
        "history": [{"month": m, "amount": round(monthly[m], 2)} for m in months_sorted],
    }
