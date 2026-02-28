"""
FinGuard AI Banking - Backend regression tests.
Covers: health, auth, wallet, transactions, beneficiaries, analytics, AI agents,
admin endpoints, admin gating, and profile.
"""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fall back to frontend/.env for direct pytest runs
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
    except Exception:
        pass

API = f"{BASE_URL}/api"

DEMO_EMAIL = "demo@finguard.ai"
DEMO_PASS = "Demo@123"
ADMIN_EMAIL = "admin@finguard.ai"
ADMIN_PASS = "Admin@123"


# ---------------- fixtures ----------------
@pytest.fixture(scope="session")
def http():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def demo_token(http):
    r = http.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS})
    assert r.status_code == 200, f"Demo login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def admin_token(http):
    r = http.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


def H(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------------- health ----------------
class TestHealth:
    def test_root(self, http):
        r = http.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("status") == "ok"

    def test_health(self, http):
        r = http.get(f"{API}/health")
        assert r.status_code == 200
        assert r.json().get("status") == "healthy"


# ---------------- auth ----------------
class TestAuth:
    def test_login_demo(self, http):
        r = http.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS})
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data and isinstance(data["access_token"], str)
        assert data["user"]["email"] == DEMO_EMAIL
        assert data["user"]["role"] == "user"

    def test_login_admin_role(self, http):
        r = http.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "admin"

    def test_login_wrong_password(self, http):
        r = http.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_with_token(self, http, demo_token):
        r = http.get(f"{API}/auth/me", headers=H(demo_token))
        assert r.status_code == 200
        assert r.json()["email"] == DEMO_EMAIL

    def test_me_unauthorized(self, http):
        r = http.get(f"{API}/auth/me")
        assert r.status_code in (401, 403)

    def test_register_creates_user_and_wallet(self, http):
        email = f"test_{uuid.uuid4().hex[:8]}@finguard.ai"
        r = http.post(
            f"{API}/auth/register",
            json={"email": email, "full_name": "Test User", "password": "Test@123"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user"]["email"] == email
        token = data["access_token"]
        # verify wallet exists for new user
        w = http.get(f"{API}/wallet", headers=H(token))
        assert w.status_code == 200
        assert w.json()["balance"] >= 0

    def test_oauth_bad_session(self, http):
        r = http.post(f"{API}/auth/oauth/session", json={"session_id": "invalid_xyz_123"})
        assert r.status_code in (401, 502)


# ---------------- wallet ----------------
class TestWallet:
    def test_get_wallet(self, http, demo_token):
        r = http.get(f"{API}/wallet", headers=H(demo_token))
        assert r.status_code == 200
        data = r.json()
        for k in ("balance", "savings", "credit_score", "currency"):
            assert k in data

    def test_deposit_increases_balance(self, http, demo_token):
        before = http.get(f"{API}/wallet", headers=H(demo_token)).json()["balance"]
        r = http.post(f"{API}/wallet/deposit", headers=H(demo_token),
                      json={"amount": 50.0, "note": "TEST_deposit"})
        assert r.status_code == 200
        tx = r.json()
        assert tx["type"] == "deposit"
        assert tx["amount"] == 50.0
        after = http.get(f"{API}/wallet", headers=H(demo_token)).json()["balance"]
        assert round(after - before, 2) == 50.0

    def test_transfer_insufficient(self, http, demo_token):
        r = http.post(f"{API}/wallet/transfer", headers=H(demo_token),
                      json={"counterparty_name": "X", "amount": 10_000_000})
        assert r.status_code == 400

    def test_transfer_to_beneficiary(self, http, demo_token):
        beneficiaries = http.get(f"{API}/beneficiaries", headers=H(demo_token)).json()
        assert isinstance(beneficiaries, list) and len(beneficiaries) > 0
        bid = beneficiaries[0]["id"]
        before = http.get(f"{API}/wallet", headers=H(demo_token)).json()["balance"]
        r = http.post(f"{API}/wallet/transfer", headers=H(demo_token),
                      json={"beneficiary_id": bid, "amount": 5.0, "note": "TEST_xfer"})
        assert r.status_code == 200, r.text
        tx = r.json()
        assert tx["type"] == "transfer_out"
        after = http.get(f"{API}/wallet", headers=H(demo_token)).json()["balance"]
        assert round(before - after, 2) == 5.0


# ---------------- transactions ----------------
class TestTransactions:
    def test_list(self, http, demo_token):
        r = http.get(f"{API}/transactions", headers=H(demo_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_filter_type(self, http, demo_token):
        r = http.get(f"{API}/transactions?type=deposit", headers=H(demo_token))
        assert r.status_code == 200
        for tx in r.json():
            assert tx["type"] == "deposit"

    def test_filter_query(self, http, demo_token):
        r = http.get(f"{API}/transactions?q=salary", headers=H(demo_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_recent_limit(self, http, demo_token):
        r = http.get(f"{API}/transactions/recent?limit=5", headers=H(demo_token))
        assert r.status_code == 200
        assert len(r.json()) <= 5


# ---------------- beneficiaries ----------------
class TestBeneficiaries:
    created_id = None

    def test_list(self, http, demo_token):
        r = http.get(f"{API}/beneficiaries", headers=H(demo_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create(self, http, demo_token):
        r = http.post(f"{API}/beneficiaries", headers=H(demo_token),
                      json={"name": "TEST_Beneficiary", "account_number": "1234567890",
                            "bank_name": "Test Bank"})
        assert r.status_code == 200, r.text
        b = r.json()
        assert b["name"] == "TEST_Beneficiary"
        TestBeneficiaries.created_id = b["id"]

    def test_delete(self, http, demo_token):
        assert TestBeneficiaries.created_id is not None
        r = http.delete(f"{API}/beneficiaries/{TestBeneficiaries.created_id}",
                        headers=H(demo_token))
        assert r.status_code == 200


# ---------------- analytics ----------------
class TestAnalytics:
    def test_cashflow(self, http, demo_token):
        r = http.get(f"{API}/analytics/cashflow?months=6", headers=H(demo_token))
        assert r.status_code == 200
        data = r.json()
        # API returns {"series": [...]}
        series = data.get("series") if isinstance(data, dict) else data
        assert isinstance(series, list) and len(series) > 0
        pt = series[0]
        assert "income" in pt and "expense" in pt and "label" in pt

    def test_expense_breakdown(self, http, demo_token):
        r = http.get(f"{API}/analytics/expense-breakdown", headers=H(demo_token))
        assert r.status_code == 200
        data = r.json()
        # API may return {breakdown:[], total:..} or list — accept either shape
        assert isinstance(data, (list, dict))
        if isinstance(data, dict):
            assert "breakdown" in data or "total" in data

    def test_spending_trend(self, http, demo_token):
        r = http.get(f"{API}/analytics/spending-trend", headers=H(demo_token))
        assert r.status_code == 200
        data = r.json()
        points = data.get("points") if isinstance(data, dict) else data
        assert isinstance(points, list)

    def test_summary(self, http, demo_token):
        r = http.get(f"{API}/analytics/summary", headers=H(demo_token))
        assert r.status_code == 200
        data = r.json()
        for k in ("income", "expense", "savings", "tx_count"):
            assert k in data


# ---------------- AI ----------------
class TestAI:
    def test_financial_health(self, http, demo_token):
        r = http.get(f"{API}/ai/financial-health", headers=H(demo_token))
        assert r.status_code == 200
        data = r.json()
        assert "score" in data and "rating" in data

    def test_spending_prediction(self, http, demo_token):
        r = http.get(f"{API}/ai/spending-prediction", headers=H(demo_token))
        assert r.status_code == 200
        data = r.json()
        assert "predicted_total" in data
        assert "by_category" in data

    def test_budget_advice(self, http, demo_token):
        r = http.get(f"{API}/ai/budget-advice", headers=H(demo_token))
        assert r.status_code == 200
        data = r.json()
        assert "tips" in data

    def test_risk_score(self, http, demo_token):
        r = http.get(f"{API}/ai/risk-score", headers=H(demo_token))
        assert r.status_code == 200
        data = r.json()
        assert "score" in data and "level" in data

    def test_fraud_alerts(self, http, demo_token):
        r = http.get(f"{API}/ai/fraud-alerts", headers=H(demo_token))
        assert r.status_code == 200
        alerts = r.json()
        assert isinstance(alerts, list)
        # Seed should include 1 flagged tx for demo user
        assert len(alerts) >= 1

    def test_assistant(self, http, demo_token):
        r = http.post(f"{API}/ai/assistant", headers=H(demo_token),
                      json={"message": "Give me a one-line savings tip."},
                      timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "response" in data and isinstance(data["response"], str)
        assert len(data["response"]) > 0


# ---------------- admin ----------------
class TestAdmin:
    def test_admin_users(self, http, admin_token):
        r = http.get(f"{API}/admin/users", headers=H(admin_token))
        assert r.status_code == 200
        users = r.json()
        assert isinstance(users, list) and len(users) >= 2
        sample = users[0]
        assert "wallet_balance" in sample
        assert "transaction_count" in sample

    def test_admin_gating(self, http, demo_token):
        r = http.get(f"{API}/admin/users", headers=H(demo_token))
        assert r.status_code == 403

    def test_admin_platform_stats(self, http, admin_token):
        r = http.get(f"{API}/admin/platform-stats", headers=H(admin_token))
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict) and len(data) > 0

    def test_admin_transactions(self, http, admin_token):
        r = http.get(f"{API}/admin/transactions", headers=H(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_activity_logs(self, http, admin_token):
        r = http.get(f"{API}/admin/activity-logs", headers=H(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_fraud_alerts(self, http, admin_token):
        r = http.get(f"{API}/admin/fraud-alerts", headers=H(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_kyc_update(self, http, admin_token):
        users = http.get(f"{API}/admin/users", headers=H(admin_token)).json()
        # find demo user
        demo = next(u for u in users if u["email"] == DEMO_EMAIL)
        r = http.patch(f"{API}/admin/users/{demo['id']}/kyc",
                       headers=H(admin_token), json={"status": "approved"})
        assert r.status_code == 200

    def test_admin_toggle_active(self, http, admin_token):
        users = http.get(f"{API}/admin/users", headers=H(admin_token)).json()
        demo = next(u for u in users if u["email"] == DEMO_EMAIL)
        # toggle twice to leave state same
        r1 = http.patch(f"{API}/admin/users/{demo['id']}/toggle-active",
                        headers=H(admin_token))
        assert r1.status_code == 200
        r2 = http.patch(f"{API}/admin/users/{demo['id']}/toggle-active",
                        headers=H(admin_token))
        assert r2.status_code == 200

    def test_admin_resolve_fraud(self, http, admin_token):
        alerts = http.get(f"{API}/admin/fraud-alerts", headers=H(admin_token)).json()
        if not alerts:
            pytest.skip("No fraud alerts to resolve")
        aid = alerts[0]["id"]
        r = http.patch(f"{API}/admin/fraud-alerts/{aid}/resolve",
                       headers=H(admin_token))
        assert r.status_code == 200


# ---------------- profile ----------------
class TestProfile:
    def test_update_full_name(self, http, demo_token):
        r = http.patch(f"{API}/users/me", headers=H(demo_token),
                       json={"full_name": "Demo User Updated"})
        assert r.status_code == 200, r.text
        # verify
        me = http.get(f"{API}/auth/me", headers=H(demo_token)).json()
        assert me["full_name"] == "Demo User Updated"
        # revert
        http.patch(f"{API}/users/me", headers=H(demo_token),
                   json={"full_name": "Demo User"})

    def test_password_wrong_current(self, http, demo_token):
        r = http.post(f"{API}/users/me/password", headers=H(demo_token),
                      json={"current_password": "WRONG_PASS",
                            "new_password": "Demo@1234"})
        assert r.status_code == 400

    def test_password_change_and_revert(self, http, demo_token):
        r = http.post(f"{API}/users/me/password", headers=H(demo_token),
                      json={"current_password": DEMO_PASS,
                            "new_password": "Demo@1234"})
        assert r.status_code == 200
        # revert
        r2 = http.post(f"{API}/users/me/password", headers=H(demo_token),
                       json={"current_password": "Demo@1234",
                             "new_password": DEMO_PASS})
        assert r2.status_code == 200
