import os
from pathlib import Path
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BACKEND_DIR / ".env")


class Settings:
    SQLITE_URL: str = os.environ.get(
        "SQLITE_URL",
        "sqlite:///./finguard.db"
    )

    JWT_SECRET_KEY: str = os.environ["JWT_SECRET_KEY"]

    JWT_ALGORITHM: str = os.environ.get(
        "JWT_ALGORITHM",
        "HS256"
    )

    JWT_EXPIRY_MINUTES: int = int(
        os.environ.get("JWT_EXPIRY_MINUTES", "1440")
    )

    GEMINI_API_KEY: str = os.environ.get(
        "GEMINI_API_KEY",
        ""
    )

    CORS_ORIGINS: str = os.environ.get(
        "CORS_ORIGINS",
        "*"
    )


settings = Settings()