from sqlalchemy.orm import Session
from app.models import ActivityLog


def log_activity(
    db: Session,
    *,
    user_id: str | None,
    actor_email: str | None,
    action: str,
    detail: str | None = None,
    ip_address: str | None = None,
) -> None:
    entry = ActivityLog(
        user_id=user_id,
        actor_email=actor_email,
        action=action,
        detail=detail,
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()
