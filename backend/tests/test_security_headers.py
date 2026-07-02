import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def api_client():
    with TestClient(app) as client:
        yield client


class TestHealthEndpoint:
    def test_health_returns_ok(self, api_client):
        r = api_client.get("/api/health")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}


class TestSecurityHeaders:
    def test_security_headers_present_on_api_responses(self, api_client):
        r = api_client.get("/api/health")
        assert r.headers["X-Content-Type-Options"] == "nosniff"
        assert r.headers["X-Frame-Options"] == "DENY"
        assert r.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
        assert "max-age=31536000" in r.headers["Strict-Transport-Security"]
        assert "camera=()" in r.headers["Permissions-Policy"]

    def test_csp_allows_only_expected_sources(self, api_client):
        csp = api_client.get("/api/health").headers["Content-Security-Policy"]
        assert "default-src 'self'" in csp
        assert "script-src 'self'" in csp
        assert "https://fonts.googleapis.com" in csp
        assert "https://fonts.gstatic.com" in csp
        assert "frame-ancestors 'none'" in csp
        # No inline/eval scripts allowed anywhere
        assert "unsafe-eval" not in csp
        assert "script-src 'self' 'unsafe-inline'" not in csp


class TestCacheHeaders:
    def test_api_responses_are_never_cached(self, api_client):
        r = api_client.get("/api/health")
        assert r.headers["Cache-Control"] == "no-store"
