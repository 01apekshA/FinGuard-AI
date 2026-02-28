from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.config.database import get_db
from app.models import User, Transaction
from app.schemas.schemas import TransactionOut
from app.utils.deps import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=List[TransactionOut])
def list_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, description="Search text"),
    type: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(
            or_(
                Transaction.description.ilike(like),
                Transaction.counterparty.ilike(like),
                Transaction.category.ilike(like),
            )
        )
    if type:
        query = query.filter(Transaction.type == type)
    if status:
        query = query.filter(Transaction.status == status)
    if category:
        query = query.filter(Transaction.category == category)

    rows = query.order_by(desc(Transaction.created_at)).offset(offset).limit(limit).all()
    return [TransactionOut.model_validate(r) for r in rows]


@router.get("/recent", response_model=List[TransactionOut])
def recent_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 8,
):
    rows = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(desc(Transaction.created_at))
        .limit(limit)
        .all()
    )
    return [TransactionOut.model_validate(r) for r in rows]
