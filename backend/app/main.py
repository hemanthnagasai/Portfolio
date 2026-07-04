from fastapi import FastAPI, APIRouter, Request
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from pathlib import Path
import os
import logging

from app.database import init_db
from app.routers import status, traces, chat, resume
from app.config import CORS_ORIGINS

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Optional error tracking. Off unless SENTRY_DSN is set — sentry_sdk is only
# imported when a DSN is present, so it costs nothing when disabled.
SENTRY_DSN = os.environ.get("SENTRY_DSN")
if SENTRY_DSN:
    try:
        import sentry_sdk
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            traces_sample_rate=float(os.environ.get("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
            environment=os.environ.get("SENTRY_ENVIRONMENT", "production"),
        )
        logger.info("Sentry error tracking enabled.")
    except Exception as e:
        logger.error(f"Sentry init failed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize local SQLite DB schemas
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1024)

# Every external resource the frontend loads must be allowlisted here:
# Google Fonts (stylesheet + font files), the inline data: SVG noise texture
# in index.css, and the Unsplash onError fallback image in Personal.tsx.
# 'unsafe-inline' for styles is required by React/Framer Motion style attributes.
#
# CSP_SCRIPT_EXTRA / CSP_CONNECT_EXTRA / CSP_IMG_EXTRA (space-separated origins)
# let deployment opt extra hosts into the matching directive without loosening
# the tight default — needed when enabling Sentry (connect to *.sentry.io) or
# GoatCounter analytics (script gc.zgo.at, connect/img the counter host).
def _csp_extra(name: str) -> str:
    value = os.environ.get(name, "").strip()
    return (" " + value) if value else ""

CONTENT_SECURITY_POLICY = "; ".join([
    "default-src 'self'",
    "script-src 'self'" + _csp_extra("CSP_SCRIPT_EXTRA"),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://images.unsplash.com" + _csp_extra("CSP_IMG_EXTRA"),
    "connect-src 'self'" + _csp_extra("CSP_CONNECT_EXTRA"),
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
])

CACHEABLE_STATIC_EXTENSIONS = (".jpeg", ".jpg", ".png", ".webp", ".svg", ".ico", ".txt", ".xml")

@app.middleware("http")
async def security_and_cache_headers(request: Request, call_next):
    response = await call_next(request)
    headers = response.headers
    headers.setdefault("Content-Security-Policy", CONTENT_SECURITY_POLICY)
    headers.setdefault("X-Content-Type-Options", "nosniff")
    headers.setdefault("X-Frame-Options", "DENY")
    headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")
    # Ignored over plain HTTP (local dev); effective behind Render's HTTPS.
    headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

    path = request.url.path
    if path.startswith("/api/"):
        headers.setdefault("Cache-Control", "no-store")
    elif path.startswith("/assets/"):
        # Vite emits content-hashed filenames, so these can never go stale.
        headers.setdefault("Cache-Control", "public, max-age=31536000, immutable")
    elif path.endswith(CACHEABLE_STATIC_EXTENSIONS):
        # Un-hashed public/ files (avatar, robots.txt, ...) - short-lived cache.
        headers.setdefault("Cache-Control", "public, max-age=86400")
    else:
        # The SPA HTML shell: always revalidate so deploys are picked up.
        headers.setdefault("Cache-Control", "no-cache")
    return response

api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {"message": "Life Portfolio API"}

@api_router.get("/health")
async def health():
    # Lightweight liveness probe for uptime monitors / keep-alive pings.
    # Deliberately touches no DB or external service.
    return {"status": "ok"}

api_router.include_router(status.router)
api_router.include_router(traces.router)
api_router.include_router(chat.router)
api_router.include_router(resume.router)

app.include_router(api_router)

# Serve static frontend files in production if available
frontend_dist_path = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist_path.exists():
    from fastapi.responses import FileResponse
    from fastapi.staticfiles import StaticFiles
    
    # Mount assets folder if it exists
    assets_path = frontend_dist_path / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")
    
    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        # Clean path to prevent directory traversal
        safe_path = os.path.normpath(catchall).lstrip("./\\")
        file_path = frontend_dist_path / safe_path
        
        # Check if the resolved file path is inside the frontend dist directory
        try:
            resolved_file = file_path.resolve()
            resolved_dist = frontend_dist_path.resolve()
            is_safe = str(resolved_file).startswith(str(resolved_dist))
        except Exception:
            is_safe = False
            
        if is_safe and file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
            
        index_file = frontend_dist_path / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"detail": "Frontend build files missing."}
