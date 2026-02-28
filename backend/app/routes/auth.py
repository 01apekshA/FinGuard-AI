from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models import User, Wallet

from app.schemas.schemas import (
    RegisterIn,
    LoginIn,
    TokenOut,
    UserOut,
)

from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)

from app.utils.deps import get_current_user
from app.utils.activity import log_activity

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut)
def register(
    payload: RegisterIn,
    request: Request,
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(
        User.email == payload.email.lower()
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role="user",
        auth_provider="local",
    )

    db.add(user)
    db.flush()

    wallet = Wallet(
        user_id=user.id,
        balance=1000.0,
        savings=200.0
    )

    db.add(wallet)

    db.commit()

    db.refresh(user)

    log_activity(
        db,
        user_id=user.id,
        actor_email=user.email,
        action="register",
        detail="New user registration",
        ip_address=request.client.host if request.client else None,
    )

    token = create_access_token(
        user.id,
        user.role
    )

    return TokenOut(
        access_token=token,
        user=UserOut.model_validate(user)
    )


@router.post("/login", response_model=TokenOut)
def login(
    payload: LoginIn,
    request: Request,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.email == payload.email.lower()
    ).first()

    if not user or not verify_password(
        payload.password,
        user.hashed_password or ""
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is inactive"
        )

    log_activity(
        db,
        user_id=user.id,
        actor_email=user.email,
        action="login",
        detail="User login",
        ip_address=request.client.host if request.client else None,
    )

    token = create_access_token(
        user.id,
        user.role
    )

    return TokenOut(
        access_token=token,
        user=UserOut.model_validate(user)
    )


@router.post("/google", response_model=TokenOut)
def google_login(
    payload: dict,
    request: Request,
    db: Session = Depends(get_db),
):
    email = payload.get("email", "").lower()

    full_name = payload.get("full_name")

    picture = payload.get("picture")

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email required"
        )

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        user = User(
            email=email,
            full_name=full_name or email.split("@")[0],
            picture=picture,
            auth_provider="google",
            role="user",
        )

        db.add(user)

        db.flush()

        wallet = Wallet(
            user_id=user.id,
            balance=1000.0,
            savings=200.0
        )

        db.add(wallet)

        db.commit()

        db.refresh(user)

    token = create_access_token(
        user.id,
        user.role
    )

    log_activity(
        db,
        user_id=user.id,
        actor_email=user.email,
        action="google_login",
        detail="Firebase Google login",
        ip_address=request.client.host if request.client else None,
    )

    return TokenOut(
        access_token=token,
        user=UserOut.model_validate(user)
    )


@router.get("/me", response_model=UserOut)
def me(
    current_user: User = Depends(get_current_user)
):
    return UserOut.model_validate(current_user)