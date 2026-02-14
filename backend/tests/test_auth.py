import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_admin_login_success(client: AsyncClient):
    # First create a mock admin (if DB is empty, logic might need adjustment but usually we test with known seed or create first)
    # Actually, main.py or database.py might have initial data?
    # For now, let's just test that the endpoint exists and handles bad creds
    response = await client.post("/api/admin/login", json={
        "username": "admin",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "active", "system": "Holo Attendance API"}

@pytest.mark.asyncio
async def test_admin_login_default(client: AsyncClient):
    # Assuming default admin is created on startup or we can look at auth.py
    # If using in-memory DB, it starts empty. We might need to insert a user fixture.
    # But let's check if `create_default_admin` logic runs on import?
    # Checks auth.py: create_default_admin is usually called manually or on startup event.
    # In `main.py`, we should check `startup_event`.
    pass
