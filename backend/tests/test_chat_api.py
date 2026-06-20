import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def api_client():
    with TestClient(app) as client:
        yield client


class FakeResponse:
    def __init__(self, text):
        self.text = text


class FakeModels:
    def __init__(self, text="hey, I'm Hemanth.", fail_primary=False, fail_all=False):
        self.text = text
        self.fail_primary = fail_primary
        self.fail_all = fail_all
        self.calls = []

    def generate_content(self, model, contents, config):
        self.calls.append(model)
        if self.fail_all:
            raise RuntimeError("All models down")
        if self.fail_primary and model == "gemini-2.5-flash":
            raise RuntimeError("Primary model quota exceeded")
        return FakeResponse(self.text)


class FakeClient:
    def __init__(self, **kwargs):
        self.models = FakeModels(**kwargs)


# -------- /api/chat success & fallback (mocked, no live network/quota dependency) ----------
class TestChatSuccess:
    def test_chat_success_mocked(self, api_client, monkeypatch):
        import app.routers.chat as chat_module
        fake_client = FakeClient(text="hey, I work at EY as a senior data analyst.")
        monkeypatch.setattr(chat_module, "get_genai_client", lambda: fake_client)

        r = api_client.post("/api/chat", json={"message": "Where do you work?", "history": []})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "response" in data and "EY" in data["response"]
        assert fake_client.models.calls == ["gemini-2.5-flash"]


class TestChatFallback:
    def test_chat_falls_back_to_secondary_model(self, api_client, monkeypatch):
        import app.routers.chat as chat_module
        fake_client = FakeClient(text="fallback response", fail_primary=True)
        monkeypatch.setattr(chat_module, "get_genai_client", lambda: fake_client)

        r = api_client.post("/api/chat", json={"message": "hi", "history": []})
        assert r.status_code == 200, r.text
        assert r.json()["response"] == "fallback response"
        assert fake_client.models.calls == ["gemini-2.5-flash", "gemini-2.0-flash"]


class TestChatAllModelsFail:
    def test_chat_returns_500_when_all_models_fail(self, api_client, monkeypatch):
        import app.routers.chat as chat_module
        fake_client = FakeClient(fail_all=True)
        monkeypatch.setattr(chat_module, "get_genai_client", lambda: fake_client)

        r = api_client.post("/api/chat", json={"message": "hi", "history": []})
        assert r.status_code == 500
        assert "Generation failed" in r.json()["detail"]


class TestChatNoClient:
    def test_chat_returns_500_when_client_not_initialized(self, api_client, monkeypatch):
        import app.routers.chat as chat_module
        monkeypatch.setattr(chat_module, "get_genai_client", lambda: None)

        r = api_client.post("/api/chat", json={"message": "hi", "history": []})
        assert r.status_code == 500
        assert "Gemini API client not initialized" in r.json()["detail"]


class TestChatValidation:
    def test_chat_rejects_empty_message(self, api_client):
        r = api_client.post("/api/chat", json={"message": "", "history": []})
        assert r.status_code == 422

    def test_chat_rejects_oversized_message(self, api_client):
        r = api_client.post("/api/chat", json={"message": "x" * 2001, "history": []})
        assert r.status_code == 422

    def test_chat_rejects_missing_message_field(self, api_client):
        r = api_client.post("/api/chat", json={"history": []})
        assert r.status_code == 422
