import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def api_client():
    with TestClient(app) as client:
        # TestClient automatically triggers the lifespan context, initializing SQLite DB
        yield client

# -------- Root ----------
class TestRoot:
    def test_root_message(self, api_client):
        r = api_client.get("/api/")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data == {"message": "Life Portfolio API"}

# -------- Resume PDF download ----------
class TestResumeDownload:
    def test_resume_download_headers_and_bytes(self, api_client):
        r = api_client.get("/api/resume/download")
        assert r.status_code == 200, r.text
        ct = r.headers.get("content-type", "")
        assert "application/pdf" in ct.lower(), f"Bad content-type: {ct}"
        cd = r.headers.get("content-disposition", "")
        assert "attachment" in cd.lower(), f"Bad content-disposition: {cd}"
        assert "Hemanth_Naga_Sai_Chakka_Resume.pdf" in cd, f"Filename missing in CD: {cd}"
        
        body = r.content
        assert len(body) > 1000, f"PDF too small ({len(body)} bytes)"
        assert body[:4] == b"%PDF", f"Not a PDF (first 8 bytes: {body[:8]!r})"
        assert b"%%EOF" in body[-256:], "PDF EOF marker missing"

# -------- Status (SQLite) ----------
class TestStatusChecks:
    def test_status_round_trip(self, api_client):
        # Initial GET should be a list
        r = api_client.get("/api/status")
        assert r.status_code == 200, r.text
        initial = r.json()
        assert isinstance(initial, list)
        initial_count = len(initial)

        # POST a new status
        client_name = "TEST_pytest_client"
        r2 = api_client.post(
            "/api/status",
            json={"client_name": client_name},
        )
        assert r2.status_code == 200, r2.text
        created = r2.json()
        assert created["client_name"] == client_name
        assert "id" in created and isinstance(created["id"], str) and len(created["id"]) > 0
        assert "timestamp" in created

        # GET should now contain it
        r3 = api_client.get("/api/status")
        assert r3.status_code == 200
        items = r3.json()
        assert len(items) >= initial_count + 1
        assert any(i.get("client_name") == client_name and i.get("id") == created["id"] for i in items), \
            "Newly created status_check not found in GET response"

# AI Chatbot (/api/chat) coverage moved to test_chat_api.py: that suite mocks the
# Gemini client so results don't depend on live network access or API quota
# (this test previously failed when the real account hit its daily quota).
