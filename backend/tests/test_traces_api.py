"""Backend tests for Life Portfolio /api/traces (guestbook).

Covers:
- POST /api/traces valid word → 200 with {id, word}
- POST /api/traces validation (empty / spaces / >24 chars / special chars)
- POST /api/traces accepts apostrophe and hyphen (self-love)
- GET  /api/traces returns list with {id, word}
- GET  /api/traces ?limit= honored
"""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
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


class TestTracesPostValid:
    def test_post_valid_word_returns_id(self, api_client):
        unique = f"t{uuid.uuid4().hex[:6]}"
        r = api_client.post(f"{BASE_URL}/api/traces", json={"word": unique}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert data["word"] == unique

    def test_post_word_with_apostrophe(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/traces", json={"word": "it's"}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["word"] == "it's"

    def test_post_word_with_hyphen(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/traces", json={"word": "self-love"}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["word"] == "self-love"

    def test_post_word_24_chars(self, api_client):
        w = "a" * 24
        r = api_client.post(f"{BASE_URL}/api/traces", json={"word": w}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["word"] == w


class TestTracesPostInvalid:
    def test_empty_word_rejected(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/traces", json={"word": ""}, timeout=15)
        assert r.status_code == 400, r.text

    def test_whitespace_word_rejected(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/traces", json={"word": "   "}, timeout=15)
        assert r.status_code == 400, r.text

    def test_word_with_spaces_rejected(self, api_client):
        r = api_client.post(
            f"{BASE_URL}/api/traces", json={"word": "hello world"}, timeout=15
        )
        assert r.status_code == 400, r.text

    def test_word_over_24_chars_rejected(self, api_client):
        w = "a" * 25
        r = api_client.post(f"{BASE_URL}/api/traces", json={"word": w}, timeout=15)
        assert r.status_code == 400, r.text

    def test_word_special_chars_rejected(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/traces", json={"word": "!@#"}, timeout=15)
        assert r.status_code == 400, r.text


class TestTracesGet:
    def test_get_returns_list_and_contains_created(self, api_client):
        unique = f"z{uuid.uuid4().hex[:8]}"
        pr = api_client.post(f"{BASE_URL}/api/traces", json={"word": unique}, timeout=15)
        assert pr.status_code == 200
        created_id = pr.json()["id"]

        r = api_client.get(f"{BASE_URL}/api/traces", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) > 0
        # Entry shape
        sample = items[0]
        assert "id" in sample and "word" in sample
        # The one we just posted should be present (recent, sorted desc)
        assert any(
            it.get("id") == created_id and it.get("word") == unique for it in items
        ), "Newly created trace not found in GET response"

    def test_get_limit_param(self, api_client):
        # Ensure at least 3 traces exist
        for i in range(3):
            api_client.post(
                f"{BASE_URL}/api/traces",
                json={"word": f"l{uuid.uuid4().hex[:5]}"},
                timeout=15,
            )
        r = api_client.get(f"{BASE_URL}/api/traces?limit=2", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) <= 2
