"""Backend API tests for Life Portfolio app.

Covers:
- GET /api/                    -> root message
- GET /api/resume/download     -> ATS-friendly PDF download
- GET/POST /api/status         -> Mongo persistence round-trip
"""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback: read from frontend .env
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.strip().split("=", 1)[1]
                    break

assert BASE_URL, "REACT_APP_BACKEND_URL not configured"
BASE_URL = BASE_URL.rstrip("/")


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# -------- Root ----------
class TestRoot:
    def test_root_message(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/", timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data == {"message": "Life Portfolio API"}


# -------- Resume PDF download ----------
class TestResumeDownload:
    def test_resume_download_headers_and_bytes(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/resume/download", timeout=30)
        assert r.status_code == 200, r.text
        ct = r.headers.get("content-type", "")
        assert "application/pdf" in ct.lower(), f"Bad content-type: {ct}"
        cd = r.headers.get("content-disposition", "")
        assert "attachment" in cd.lower(), f"Bad content-disposition: {cd}"
        assert "Hemanth_Naga_Sai_Chakka_Resume.pdf" in cd, f"Filename missing in CD: {cd}"
        # Validate PDF magic bytes & non-empty
        body = r.content
        assert len(body) > 1000, f"PDF too small ({len(body)} bytes)"
        assert body[:4] == b"%PDF", f"Not a PDF (first 8 bytes: {body[:8]!r})"
        # Should end with EOF marker (allow trailing whitespace)
        assert b"%%EOF" in body[-256:], "PDF EOF marker missing"


# -------- Status (Mongo) ----------
class TestStatusChecks:
    def test_status_round_trip(self, api_client):
        # Initial GET should be a list
        r = api_client.get(f"{BASE_URL}/api/status", timeout=15)
        assert r.status_code == 200, r.text
        initial = r.json()
        assert isinstance(initial, list)
        initial_count = len(initial)

        # POST a new status
        client_name = "TEST_pytest_client"
        r2 = api_client.post(
            f"{BASE_URL}/api/status",
            json={"client_name": client_name},
            timeout=15,
        )
        assert r2.status_code == 200, r2.text
        created = r2.json()
        assert created["client_name"] == client_name
        assert "id" in created and isinstance(created["id"], str) and len(created["id"]) > 0
        assert "timestamp" in created

        # GET should now contain it
        r3 = api_client.get(f"{BASE_URL}/api/status", timeout=15)
        assert r3.status_code == 200
        items = r3.json()
        assert len(items) >= initial_count + 1
        assert any(i.get("client_name") == client_name and i.get("id") == created["id"] for i in items), \
            "Newly created status_check not found in GET response"
