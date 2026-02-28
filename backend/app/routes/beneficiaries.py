from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models import User, Beneficiary
from app.schemas.schemas import BeneficiaryIn, BeneficiaryOut
from app.utils.deps import get_current_user

router = APIRouter(prefix="/beneficiaries", tags=["beneficiaries"])


@router.get("", response_model=List[BeneficiaryOut])
def list_beneficiaries(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    rows = db.query(Beneficiary).filter(Beneficiary.user_id == current_user.id).all()
    return [BeneficiaryOut.model_validate(r) for r in rows]


@router.post("", response_model=BeneficiaryOut)
def add_beneficiary(
    payload: BeneficiaryIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    b = Beneficiary(
        user_id=current_user.id,
        name=payload.name,
        account_number=payload.account_number,
        bank_name=payload.bank_name,
        nickname=payload.nickname,
        avatar_color=payload.avatar_color or "#10B981",
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return BeneficiaryOut.model_validate(b)


@router.delete("/{beneficiary_id}")
def delete_beneficiary(
    beneficiary_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    b = (
        db.query(Beneficiary)
        .filter(Beneficiary.id == beneficiary_id, Beneficiary.user_id == current_user.id)
        .first()
    )
    if not b:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    db.delete(b)
    db.commit()
    return {"success": True}
