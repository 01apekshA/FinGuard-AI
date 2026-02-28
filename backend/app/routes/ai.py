from typing import List
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.config.database import get_db
from app.models import User, FraudAlert, AIInsight
from app.schemas.schemas import FraudAlertOut, AIInsightOut, AIChatIn, AIChatOut
from app.utils.deps import get_current_user
from app.agents import (
    financial_health_agent,
    spending_prediction_agent,
    budget_advisor_agent,
    risk_scoring_agent,
)
from app.agents.llm_client import chat_once

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/fraud-alerts", response_model=List[FraudAlertOut])
def fraud_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(FraudAlert)
        .filter(FraudAlert.user_id == current_user.id)
        .order_by(desc(FraudAlert.created_at))
        .limit(50)
        .all()
    )
    return [FraudAlertOut.model_validate(r) for r in rows]


@router.get("/financial-health")
def financial_health(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return financial_health_agent.compute_health(db, current_user.id)


@router.get("/spending-prediction")
def spending_prediction(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return spending_prediction_agent.predict_next_month(db, current_user.id)


@router.get("/budget-advice")
async def budget_advice(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return await budget_advisor_agent.advise(db, current_user.id, use_llm=True)


@router.get("/risk-score")
def risk_score(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return risk_scoring_agent.compute_risk(db, current_user.id)


@router.get("/insights", response_model=List[AIInsightOut])
def insights(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(AIInsight)
        .filter(AIInsight.user_id == current_user.id)
        .order_by(desc(AIInsight.created_at))
        .limit(20)
        .all()
    )
    return [AIInsightOut.model_validate(r) for r in rows]


@router.post("/assistant", response_model=AIChatOut)
async def assistant(
    payload: AIChatIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Conversational AI assistant powered by Claude Sonnet 4.5 with financial context."""
    session_id = payload.session_id or f"assist-{current_user.id}-{uuid.uuid4().hex[:8]}"
    health = financial_health_agent.compute_health(db, current_user.id)
    risk = risk_scoring_agent.compute_risk(db, current_user.id)

    context = (
        f"User: {current_user.full_name}. "
        f"Balance: ${health['balance']:.2f}. Savings: ${health['savings']:.2f}. "
        f"30d income: ${health['income_30d']:.2f}, expense: ${health['expense_30d']:.2f}. "
        f"Health score: {health['score']} ({health['rating']}). "
        f"Risk: {risk['level']} ({risk['score']})."
    )
    system = (
        "You are FinGuard AI, a friendly fintech assistant for a banking app. "
        "Be concise, helpful, and specific. Use the user's data below to personalize advice. "
        "Avoid jargon. Keep answers under 80 words.\n\n"
        f"User context: {context}"
    )

    reply = await chat_once(
        session_id=session_id,
        system_message=system,
        user_text=payload.message,
    )
    if not reply:
        reply = (
            f"Here's a quick view: balance ${health['balance']:.0f}, "
            f"savings ${health['savings']:.0f}, health score {health['score']}/100. "
            "Ask me to break down your spending or suggest savings goals."
        )
    return AIChatOut(response=reply, session_id=session_id)
