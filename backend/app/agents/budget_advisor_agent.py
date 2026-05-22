"""Generate budget recommendations using Gemini AI."""

from datetime import datetime, timedelta, timezone
from collections import defaultdict
from typing import List
from sqlalchemy.orm import Session

from app.models import Transaction
from app.agents.llm_client import chat_once


async def advise(db: Session, user_id: str, use_llm: bool = True) -> dict:
    since = datetime.now(timezone.utc) - timedelta(days=30)

    txs = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.created_at >= since,
            Transaction.type.in_(["transfer_out", "payment", "withdrawal"]),
        )
        .all()
    )

    cat_totals = defaultdict(float)
    total_expense = 0.0

    for t in txs:
        cat_totals[t.category] += t.amount
        total_expense += t.amount

    tips: List[str] = []

    if total_expense == 0:
        tips.append(
            "Start tracking spending. Even small purchases add up over time."
        )
    else:
        sorted_cats = sorted(
            cat_totals.items(),
            key=lambda x: x[1],
            reverse=True
        )

        top_cat, top_amount = sorted_cats[0]
        pct = (top_amount / total_expense) * 100

        if pct > 40:
            tips.append(
                f"{top_cat.title()} accounts for {pct:.0f}% of spending. Consider setting a monthly limit."
            )

        if cat_totals.get("food", 0) > 600:
            tips.append(
                "Food spending is high. Meal planning could reduce expenses."
            )

        if cat_totals.get("entertainment", 0) > 250:
            tips.append(
                "Review entertainment subscriptions and remove unused ones."
            )

        if cat_totals.get("transport", 0) > 300:
            tips.append(
                "Transport costs are rising. Public transit may help reduce spending."
            )

        tips.append(
            "Try following the 50/30/20 budgeting rule."
        )

    summary = " ".join(tips[:3])

    llm_summary = ""

    if use_llm and txs:
        prompt = (
            f"Total monthly expense: ${total_expense:.2f}. "
            f"Category breakdown: "
            + ", ".join(
                f"{k}: ${v:.0f}" for k, v in cat_totals.items()
            )
            + ". Give 2 short budgeting tips."
        )

        llm_summary = await chat_once(
            system_message="You are a smart financial advisor.",
            user_text=prompt,
        )

    return {
        "tips": tips[:5],
        "category_breakdown": [
            {
                "category": k,
                "amount": round(v, 2)
            }
            for k, v in cat_totals.items()
        ],
        "total_expense": round(total_expense, 2),
        "summary": summary,
        "ai_summary": llm_summary or summary,
    }