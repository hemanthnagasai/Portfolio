import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def api_client():
    with TestClient(app) as client:
        yield client


class FakeChunk:
    def __init__(self, text):
        self.text = text


class FakeModels:
    def __init__(self, text="hey, I'm Hemanth.", chunks=None, fail_primary=False, fail_all=False):
        # `chunks` lets a test control how the reply is split across the stream;
        # by default the whole text arrives as a single chunk.
        self.chunks = chunks if chunks is not None else [text]
        self.fail_primary = fail_primary
        self.fail_all = fail_all
        self.calls = []
        self.last_contents = None

    def generate_content_stream(self, model, contents, config):
        self.calls.append(model)
        self.last_contents = contents
        if self.fail_all:
            raise RuntimeError("All models down")
        if self.fail_primary and model == "gemini-2.5-flash":
            raise RuntimeError("Primary model quota exceeded")
        return iter([FakeChunk(c) for c in self.chunks])


class FakeClient:
    def __init__(self, **kwargs):
        self.models = FakeModels(**kwargs)


# -------- /api/chat success & fallback (mocked, no live network/quota dependency) ----------
class TestChatSuccess:
    def test_chat_success_mocked(self, api_client, monkeypatch):
        import app.routers.chat as chat_module
        fake_client = FakeClient(text="hey, I work at EY as an associate consultant.")
        monkeypatch.setattr(chat_module, "get_genai_client", lambda: fake_client)

        r = api_client.post("/api/chat", json={"message": "Where do you work?", "history": []})
        assert r.status_code == 200, r.text
        assert "EY" in r.text
        assert fake_client.models.calls == ["gemini-2.5-flash"]

    def test_chat_streams_multiple_chunks_in_order(self, api_client, monkeypatch):
        import app.routers.chat as chat_module
        fake_client = FakeClient(chunks=["hey, ", "i love ", "cricket."])
        monkeypatch.setattr(chat_module, "get_genai_client", lambda: fake_client)

        r = api_client.post("/api/chat", json={"message": "hobbies?", "history": []})
        assert r.status_code == 200, r.text
        assert r.text == "hey, i love cricket."


class TestChatFallback:
    def test_chat_falls_back_to_secondary_model(self, api_client, monkeypatch):
        import app.routers.chat as chat_module
        fake_client = FakeClient(text="fallback response", fail_primary=True)
        monkeypatch.setattr(chat_module, "get_genai_client", lambda: fake_client)

        r = api_client.post("/api/chat", json={"message": "hi", "history": []})
        assert r.status_code == 200, r.text
        assert r.text == "fallback response"
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

    def test_chat_rejects_oversized_history(self, api_client):
        # Schema caps history at 40 messages so a single request can't carry
        # an arbitrarily large token payload to Gemini.
        history = [{"role": "user", "content": f"msg {i}"} for i in range(41)]
        r = api_client.post("/api/chat", json={"message": "hi", "history": history})
        assert r.status_code == 422

    def test_chat_forwards_only_last_20_history_messages(self, api_client, monkeypatch):
        import app.routers.chat as chat_module
        fake_client = FakeClient()
        monkeypatch.setattr(chat_module, "get_genai_client", lambda: fake_client)

        history = [{"role": "user", "content": f"msg {i}"} for i in range(40)]
        r = api_client.post("/api/chat", json={"message": "latest", "history": history})
        assert r.status_code == 200, r.text
        # 20 truncated history messages + the new message itself
        contents = fake_client.models.last_contents
        assert len(contents) == 21
        assert contents[0].parts[0].text == "msg 20"
        assert contents[-1].parts[0].text == "latest"
