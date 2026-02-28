from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .settings import settings

# SQLite needs check_same_thread=False to allow connections across FastAPI threads
engine = create_engine(
    settings.SQLITE_URL,
    connect_args={"check_same_thread": False} if settings.SQLITE_URL.startswith("sqlite") else {},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
