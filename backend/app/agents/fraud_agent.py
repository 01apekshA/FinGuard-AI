"""Rule-based fraud detection with risk scoring."""
from datetime import datetime, timedelta, timezone
from typing import List
from sqlalchemy.orm import Session
from app.models import Transaction, FraudAlert


LARGE_TX_THRESHOLD = 2000.0
RAPID_WINDOW_SECONDS = 60
RAPID_COUNT = 3
NIGHT_HOURS = range(0, 6)  # 12am-6am local proxy


def evaluate_transaction(db: Session, tx: Transaction) -> dict:
    """Evaluate a transaction; returns dict with risk_score, severity, reasons, is_flagged."""
    reasons: List[str] = []
    risk = 0.0

    # Rule 1: large transactions
    if tx.amount >= LARGE_TX_THRESHOLD:
        reasons.append(f"Large transaction (${tx.amount:,.2f})")
        risk += 35

    # Rule 2: rapid repeated payments (3+ outgoing in 60s)
    since = datetime.now(timezone.utc) - timedelta(seconds=RAPID_WINDOW_SECONDS)
    recent = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == tx.user_id,
            Transaction.type.in_(["transfer_out", "payment", "withdrawal"]),
            Transaction.created_at >= since,
        )
        .count()
    )
    if recent >= RAPID_COUNT:
        reasons.append(f"Rapid repeated payments ({recent} in {RAPID_WINDOW_SECONDS}s)")
        risk += 30

    # Rule 3: unusual hour
    if tx.created_at.hour in NIGHT_HOURS:
        reasons.append("Unusual transaction timing (late night)")
        risk += 15

    # Rule 4: round-number high transfers (often suspicious)
    if tx.amount >= 500 and tx.amount == int(tx.amount) and tx.amount % 100 == 0:
        reasons.append("Round high amount")
        risk += 10

    risk = min(risk, 100.0)
    severity = "low"
    if risk >= 60:
        severity = "high"
    elif risk >= 30:
        severity = "medium"

    return {
        "risk_score": risk,
        "severity": severity,
        "reasons": reasons,
        "is_flagged": "yes" if risk >= 30 else "no",
    }


def create_alert_if_needed(db: Session, tx: Transaction) -> FraudAlert | None:
    result = evaluate_transaction(db, tx)
    tx.risk_score = result["risk_score"]
    tx.is_flagged = result["is_flagged"]
    if result["is_flagged"] == "yes":
        tx.status = "flagged"
        alert = FraudAlert(
            user_id=tx.user_id,
            transaction_id=tx.id,
            severity=result["severity"],
            reason="; ".join(result["reasons"]) or "Suspicious activity detected",
            risk_score=result["risk_score"],
            status="open",
        )
        db.add(alert)
        return alert
    return None
