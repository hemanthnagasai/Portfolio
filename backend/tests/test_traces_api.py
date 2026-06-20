import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def api_client():
    with TestClient(app) as client:
        yield client

class TestTracesPostValid:
    def test_post_valid_word_returns_id(self, api_client):
        unique = "t" + "".join([c for c in uuid.uuid4().hex if c.isalpha()])[:6]
        r = api_client.post("/api/traces", json={"word": unique})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert data["word"] == unique

    def test_post_word_with_apostrophe(self, api_client):
        r = api_client.post("/api/traces", json={"word": "it's"})
        assert r.status_code == 200, r.text
        assert r.json()["word"] == "it's"

    def test_post_word_with_hyphen(self, api_client):
        r = api_client.post("/api/traces", json={"word": "self-love"})
        assert r.status_code == 200, r.text
        assert r.json()["word"] == "self-love"

    def test_post_word_24_chars(self, api_client):
        w = "a" * 24
        r = api_client.post("/api/traces", json={"word": w})
        assert r.status_code == 200, r.text
        assert r.json()["word"] == w

class TestTracesPostInvalid:
    def test_empty_word_rejected(self, api_client):
        r = api_client.post("/api/traces", json={"word": ""})
        assert r.status_code == 400, r.text

    def test_whitespace_word_rejected(self, api_client):
        r = api_client.post("/api/traces", json={"word": "   "})
        assert r.status_code == 400, r.text

    def test_word_with_spaces_rejected(self, api_client):
        r = api_client.post(
            "/api/traces", json={"word": "hello world"}
        )
        assert r.status_code == 400, r.text

    def test_word_over_24_chars_rejected(self, api_client):
        w = "a" * 25
        r = api_client.post("/api/traces", json={"word": w})
        assert r.status_code == 400, r.text

    def test_word_special_chars_rejected(self, api_client):
        r = api_client.post("/api/traces", json={"word": "!@#"})
        assert r.status_code == 400, r.text

    def test_offline_profanity_rejected(self, api_client):
        r = api_client.post("/api/traces", json={"word": "fuck"})
        assert r.status_code == 400
        assert r.json()["detail"] == "Inappropriate content is not allowed."

    def test_ai_profanity_mocked(self, api_client, monkeypatch):
        import app.routers.traces
        async def mock_inappropriate(word: str) -> bool:
            return True
        monkeypatch.setattr(app.routers.traces, "is_word_inappropriate", mock_inappropriate)
        
        r = api_client.post("/api/traces", json={"word": "inappropriate"})
        assert r.status_code == 400
        assert r.json()["detail"] == "Inappropriate content is not allowed."


class TestTracesGet:
    def test_get_returns_list_and_contains_created(self, api_client):
        unique = "z" + "".join([c for c in uuid.uuid4().hex if c.isalpha()])[:8]
        pr = api_client.post("/api/traces", json={"word": unique})
        assert pr.status_code == 200
        created_id = pr.json()["id"]

        r = api_client.get("/api/traces")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) > 0
        sample = items[0]
        assert "id" in sample and "word" in sample
        assert any(
            it.get("id") == created_id and it.get("word") == unique for it in items
        ), "Newly created trace not found in GET response"

    def test_get_limit_param(self, api_client):
        for _ in range(3):
            api_client.post(
                "/api/traces",
                json={"word": f"l{uuid.uuid4().hex[:5]}"},
            )
        r = api_client.get("/api/traces?limit=2")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) <= 2

class TestTracesDelete:
    def test_delete_unauthorized(self, api_client):
        r = api_client.delete("/api/traces/testword")
        assert r.status_code == 401

    def test_delete_success(self, api_client, monkeypatch):
        monkeypatch.setenv("ADMIN_TOKEN", "secrettoken")
        word = "todelete"
        api_client.post("/api/traces", json={"word": word})
        
        r = api_client.get("/api/traces")
        assert any(item["word"] == word for item in r.json())
        
        r = api_client.delete(f"/api/traces/{word}", headers={"X-Admin-Token": "secrettoken"})
        assert r.status_code == 200
        assert r.json()["message"] == f"Trace '{word}' deleted successfully"
        
        r = api_client.get("/api/traces")
        assert not any(item["word"] == word for item in r.json())

    def test_delete_not_found(self, api_client, monkeypatch):
        monkeypatch.setenv("ADMIN_TOKEN", "secrettoken")
        r = api_client.delete("/api/traces/nonexistent", headers={"X-Admin-Token": "secrettoken"})
        assert r.status_code == 404

