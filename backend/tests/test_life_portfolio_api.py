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

# -------- AI Chatbot (/api/chat) ----------
class TestChatBot:
    def test_chat_success(self, api_client):
        # If no GEMINI_API_KEY is configured in the test environment, skip or verify mock
        # We try to call it; if it returns 500 because of key missing, it's expected.
        # If the key is there, it should pass with 200.
        import os
        if not os.environ.get("GEMINI_API_KEY"):
            # If no API key, check that we get a 500 stating client not initialized
            payload = {
                "message": "Hi Hemanth, where do you work?",
                "history": []
            }
            r = api_client.post("/api/chat", json=payload)
            assert r.status_code == 500
            assert "Gemini API client not initialized" in r.json()["detail"]
        else:
            payload = {
                "message": "Hi Hemanth, where do you work?",
                "history": [
                    {"role": "user", "content": "Hello"},
                    {"role": "model", "content": "Hey there, I'm Hemanth."}
                ]
            }
            r = api_client.post("/api/chat", json=payload)
            assert r.status_code == 200, r.text
            data = r.json()
            assert "response" in data and isinstance(data["response"], str)
            assert len(data["response"]) > 0
            resp_lower = data["response"].lower()
            assert any(x in resp_lower for x in ["ey", "ernst", "young", "analyst", "work"]), \
                f"Response didn't mention work details: {data['response']}"
