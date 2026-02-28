import logging
import os
import jwt
import datetime

from dotenv import load_dotenv

from fastapi import FastAPI, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from firebase_admin import auth

import firebase_admin_config

from app.config.database import Base, engine, SessionLocal
from app.config.settings import settings
from app.routes import (
    auth as auth_routes,
    wallet,
    transactions,
    beneficiaries,
    analytics,
    ai,
    admin,
    users,
)
from app.services.seed import run_seed
from app import models  # noqa: F401


load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title="FinGuard AI Banking API",
        version="1.0.0"
    )

    # CORS
    origins = (
        settings.CORS_ORIGINS.split(",")
        if settings.CORS_ORIGINS != "*"
        else ["*"]
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Create DB tables
    Base.metadata.create_all(bind=engine)

    # Seed data
    with SessionLocal() as db:
        try:
            run_seed(db)
        except Exception as e:
            logger.error("Seed failed: %s", e)

    # API Router
    api_router = APIRouter(prefix="/api")

    # Existing routes
    api_router.include_router(auth_routes.router)
    api_router.include_router(wallet.router)
    api_router.include_router(transactions.router)
    api_router.include_router(beneficiaries.router)
    api_router.include_router(analytics.router)
    api_router.include_router(ai.router)
    api_router.include_router(admin.router)
    api_router.include_router(users.router)

    # Root route
    @api_router.get("/")
    def root():
        return {
            "name": "FinGuard AI Banking API",
            "status": "ok"
        }

    # Health route
    @api_router.get("/health")
    def health():
        return {
            "status": "healthy"
        }

    # GOOGLE AUTH ROUTE
    @api_router.post("/auth/google")
    async def google_login(request: Request):
        try:
            data = await request.json()

            token = data.get("token")

            if not token:
                return JSONResponse(
                    status_code=400,
                    content={
                        "error": "Token missing"
                    }
                )

            # Verify Firebase token
            decoded_token = auth.verify_id_token(token)

            user_data = {
                "email": decoded_token.get("email"),
                "name": decoded_token.get("name"),
                "picture": decoded_token.get("picture"),
            }

            # Create app JWT
            app_token = jwt.encode(
                {
                    "user": user_data,
                    "exp": datetime.datetime.utcnow()
                    + datetime.timedelta(days=7),
                },
                os.getenv("JWT_SECRET"),
                algorithm="HS256",
            )

            return {
                "token": app_token,
                "user": user_data
            }

        except Exception as e:
            print("GOOGLE AUTH ERROR:", str(e))

            return JSONResponse(
                status_code=401,
                content={
                    "error": str(e)
                }
            )

    # Include router
    app.include_router(api_router)

    return app


app = create_app()