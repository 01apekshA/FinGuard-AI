"""Seed initial admin + demo user with realistic transactions."""
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models import User, Wallet, Transaction, Beneficiary, FraudAlert
from app.utils.security import hash_password
from app.agents.fraud_agent import create_alert_if_needed


CATEGORIES = ["food", "transport", "shopping", "entertainment", "bills", "groceries", "health"]
INCOME_CATS = ["salary", "freelance", "investment"]
MERCHANTS = {
    "food": ["Bluefin Cafe", "Sushi Bar", "Ramen Spot", "Pizzeria Romano"],
    "transport": ["Uber", "Lyft", "MetroPass", "ShellGas"],
    "shopping": ["Amazon", "Zara", "Apple Store", "Target"],
    "entertainment": ["Netflix", "Spotify", "Hulu", "AMC Theatres"],
    "bills": ["ConEdison", "T-Mobile", "Comcast", "AT&T"],
    "groceries": ["Whole Foods", "Trader Joe's", "Aldi", "Costco"],
    "health": ["CVS Pharmacy", "Walgreens", "Fitness Club"],
}


def _ensure_admin(db: Session):
    admin = db.query(User).filter(User.email == "admin@finguard.ai").first()
    if not admin:
        admin = User(
            email="admin@finguard.ai",
            full_name="Aria Mitchell",
            hashed_password=hash_password("Admin@123"),
            role="admin",
            kyc_status="approved",
            auth_provider="local",
            picture="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
        )
        db.add(admin)
        db.flush()
        db.add(Wallet(user_id=admin.id, balance=25000.0, savings=12000.0, credit_score=812))
        db.commit()


def _ensure_demo(db: Session):
    demo = db.query(User).filter(User.email == "demo@finguard.ai").first()
    if demo:
        return
    demo = User(
        email="demo@finguard.ai",
        full_name="Jordan Rivera",
        hashed_password=hash_password("Demo@123"),
        role="user",
        kyc_status="approved",
        auth_provider="local",
        picture="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
    )
    db.add(demo)
    db.flush()
    wallet = Wallet(user_id=demo.id, balance=8420.55, savings=3200.0, credit_score=748)
    db.add(wallet)

    # Beneficiaries
    beneficiaries = [
        Beneficiary(user_id=demo.id, name="Sofia Park", account_number="0021-4471-3398",
                    bank_name="Chase", nickname="Sister", avatar_color="#10B981"),
        Beneficiary(user_id=demo.id, name="Liam Chen", account_number="0817-2245-7791",
                    bank_name="Bank of America", nickname="Roommate", avatar_color="#3B82F6"),
        Beneficiary(user_id=demo.id, name="Aiden Brooks", account_number="0033-9911-6620",
                    bank_name="Wells Fargo", nickname=None, avatar_color="#F59E0B"),
    ]
    for b in beneficiaries:
        db.add(b)

    # Generate 90 days of varied transactions
    random.seed(42)
    now = datetime.now(timezone.utc)
    for d in range(90, 0, -1):
        date = now - timedelta(days=d)
        # Salary on the 1st of each month
        if date.day == 1:
            tx = Transaction(
                user_id=demo.id,
                type="deposit",
                category="salary",
                amount=round(random.uniform(4800, 5400), 2),
                description="Monthly salary",
                counterparty="Acme Corp Payroll",
                status="completed",
                created_at=date,
            )
            db.add(tx)
        # Random 0-4 expense transactions per day
        for _ in range(random.randint(0, 4)):
            cat = random.choice(CATEGORIES)
            merchant = random.choice(MERCHANTS[cat])
            amount = round(random.uniform(8.0, 220.0), 2)
            tx = Transaction(
                user_id=demo.id,
                type=random.choice(["payment", "transfer_out"]),
                category=cat,
                amount=amount,
                description=f"{cat.title()} - {merchant}",
                counterparty=merchant,
                status="completed",
                created_at=date.replace(hour=random.randint(7, 22), minute=random.randint(0, 59)),
            )
            db.add(tx)

    # One large suspicious transaction to demo fraud detection
    susp_date = now - timedelta(days=2, hours=2)
    susp_date = susp_date.replace(hour=2, minute=14)
    tx = Transaction(
        user_id=demo.id,
        type="transfer_out",
        category="other",
        amount=3500.00,
        description="Wire transfer",
        counterparty="Unknown Recipient",
        counterparty_account="0099-XXXX-XXXX",
        status="flagged",
        created_at=susp_date,
    )
    db.add(tx)
    db.flush()
    create_alert_if_needed(db, tx)

    db.commit()


def run_seed(db: Session):
    _ensure_admin(db)
    _ensure_demo(db)
