from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models import User, Wallet, Transaction, Beneficiary
from app.schemas.schemas import WalletOut, DepositIn, TransferIn, TransactionOut
from app.utils.deps import get_current_user
from app.utils.activity import log_activity
from app.agents.fraud_agent import create_alert_if_needed

router = APIRouter(prefix="/wallet", tags=["wallet"])


@router.get("", response_model=WalletOut)
def get_wallet(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=0.0, savings=0.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return WalletOut.model_validate(wallet)


@router.post("/deposit", response_model=TransactionOut)
def deposit(
    payload: DepositIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=0.0)
        db.add(wallet)
        db.flush()
    wallet.balance += payload.amount

    tx = Transaction(
        user_id=current_user.id,
        type="deposit",
        category="income",
        amount=payload.amount,
        currency=wallet.currency,
        description=payload.note or "Deposit",
        counterparty="Self deposit",
        status="completed",
        created_at=datetime.now(timezone.utc),
    )
    db.add(tx)
    db.flush()
    create_alert_if_needed(db, tx)
    db.commit()
    db.refresh(tx)

    log_activity(db, user_id=current_user.id, actor_email=current_user.email,
                 action="deposit", detail=f"${payload.amount:.2f}")
    return TransactionOut.model_validate(tx)


@router.post("/transfer", response_model=TransactionOut)
def transfer(
    payload: TransferIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet or wallet.balance < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    counterparty_name = payload.counterparty_name
    counterparty_account = payload.counterparty_account
    if payload.beneficiary_id:
        beneficiary = (
            db.query(Beneficiary)
            .filter(Beneficiary.id == payload.beneficiary_id, Beneficiary.user_id == current_user.id)
            .first()
        )
        if not beneficiary:
            raise HTTPException(status_code=404, detail="Beneficiary not found")
        counterparty_name = beneficiary.name
        counterparty_account = beneficiary.account_number

    if not counterparty_name:
        raise HTTPException(status_code=400, detail="Counterparty required")

    wallet.balance -= payload.amount

    tx = Transaction(
        user_id=current_user.id,
        type="transfer_out",
        category=payload.category or "transfer",
        amount=payload.amount,
        currency=wallet.currency,
        description=payload.note or f"Transfer to {counterparty_name}",
        counterparty=counterparty_name,
        counterparty_account=counterparty_account,
        status="completed",
        created_at=datetime.now(timezone.utc),
    )
    db.add(tx)
    db.flush()
    create_alert_if_needed(db, tx)
    db.commit()
    db.refresh(tx)

    log_activity(db, user_id=current_user.id, actor_email=current_user.email,
                 action="transfer", detail=f"${payload.amount:.2f} to {counterparty_name}")
    return TransactionOut.model_validate(tx)
