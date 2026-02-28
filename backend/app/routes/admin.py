from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.config.database import get_db
from app.models import User, Wallet, Transaction, FraudAlert, ActivityLog
from app.schemas.schemas import (
    AdminUserOut,
    KYCUpdateIn,
    FraudAlertOut,
    ActivityLogOut,
    TransactionOut,
)
from app.utils.deps import require_admin
from app.utils.activity import log_activity

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=List[AdminUserOut])
def list_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).order_by(desc(User.created_at)).all()
    out = []
    for u in users:
        wallet = db.query(Wallet).filter(Wallet.user_id == u.id).first()
        tx_count = db.query(Transaction).filter(Transaction.user_id == u.id).count()
        out.append(
            AdminUserOut(
                id=u.id,
                email=u.email,
                full_name=u.full_name,
                role=u.role,
                kyc_status=u.kyc_status,
                picture=u.picture,
                phone=u.phone,
                auth_provider=u.auth_provider,
                is_active=u.is_active,
                created_at=u.created_at,
                wallet_balance=wallet.balance if wallet else 0.0,
                transaction_count=tx_count,
            )
        )
    return out


@router.patch("/users/{user_id}/kyc")
def update_kyc(
    user_id: str,
    payload: KYCUpdateIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if payload.status not in ("pending", "approved", "rejected"):
        raise HTTPException(status_code=400, detail="Invalid status")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.kyc_status = payload.status
    db.commit()
    log_activity(
        db,
        user_id=admin.id,
        actor_email=admin.email,
        action=f"kyc_{payload.status}",
        detail=f"User {user.email} KYC -> {payload.status}",
    )
    return {"success": True, "kyc_status": user.kyc_status}


@router.patch("/users/{user_id}/toggle-active")
def toggle_active(
    user_id: str, admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user.is_active = not user.is_active
    db.commit()
    log_activity(
        db,
        user_id=admin.id,
        actor_email=admin.email,
        action="user_toggle_active",
        detail=f"{user.email} active={user.is_active}",
    )
    return {"success": True, "is_active": user.is_active}


@router.get("/fraud-alerts", response_model=List[FraudAlertOut])
def all_fraud_alerts(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    rows = db.query(FraudAlert).order_by(desc(FraudAlert.created_at)).limit(200).all()
    return [FraudAlertOut.model_validate(r) for r in rows]


@router.patch("/fraud-alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: str, admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    alert = db.query(FraudAlert).filter(FraudAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "resolved"
    db.commit()
    log_activity(
        db, user_id=admin.id, actor_email=admin.email,
        action="fraud_resolved", detail=f"Alert {alert_id}",
    )
    return {"success": True}


@router.get("/transactions", response_model=List[TransactionOut])
def all_transactions(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
    limit: int = 100,
):
    rows = db.query(Transaction).order_by(desc(Transaction.created_at)).limit(limit).all()
    return [TransactionOut.model_validate(r) for r in rows]


@router.get("/activity-logs", response_model=List[ActivityLogOut])
def activity_logs(
    admin: User = Depends(require_admin), db: Session = Depends(get_db), limit: int = 100
):
    rows = db.query(ActivityLog).order_by(desc(ActivityLog.created_at)).limit(limit).all()
    return [ActivityLogOut.model_validate(r) for r in rows]


@router.get("/platform-stats")
def platform_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active.is_(True)).count()
    total_tx = db.query(Transaction).count()
    flagged_tx = db.query(Transaction).filter(Transaction.is_flagged == "yes").count()
    open_alerts = db.query(FraudAlert).filter(FraudAlert.status == "open").count()
    pending_kyc = db.query(User).filter(User.kyc_status == "pending").count()
    total_volume = db.query(Transaction).with_entities(Transaction.amount).all()
    volume = round(sum(t.amount for t in total_volume), 2)
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_transactions": total_tx,
        "flagged_transactions": flagged_tx,
        "open_fraud_alerts": open_alerts,
        "pending_kyc": pending_kyc,
        "total_volume": volume,
    }
