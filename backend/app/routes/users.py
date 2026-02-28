from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.config.database import get_db
from app.models import User
from app.utils.deps import get_current_user
from app.utils.security import hash_password, verify_password

router = APIRouter(prefix="/users", tags=["users"])


class ProfileUpdateIn(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    picture: str | None = None


class PasswordUpdateIn(BaseModel):
    current_password: str
    new_password: str


@router.patch("/me")
def update_profile(
    payload: ProfileUpdateIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.picture is not None:
        current_user.picture = payload.picture
    db.commit()
    db.refresh(current_user)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "picture": current_user.picture,
    }


@router.post("/me/password")
def change_password(
    payload: PasswordUpdateIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.auth_provider != "local":
        raise HTTPException(status_code=400, detail="Password not applicable for OAuth accounts")
    if not verify_password(payload.current_password, current_user.hashed_password or ""):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be 6+ characters")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"success": True}
