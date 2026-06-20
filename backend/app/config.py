import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
DB_NAME = os.environ.get("DB_NAME", "portfolio")

# Strict default CORS origins to prevent unauthorized cross-origin requests
cors_origins_env = os.environ.get("CORS_ORIGINS", "")
if cors_origins_env and cors_origins_env != "*":
    CORS_ORIGINS = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
else:
    CORS_ORIGINS = [
        "http://localhost:5000",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
PORTFOLIO_JSON_PATH = BASE_DIR / "frontend" / "src" / "data" / "portfolio.json"
# Fallback in case of absolute docker paths
if not PORTFOLIO_JSON_PATH.exists():
    PORTFOLIO_JSON_PATH = BASE_DIR.parent / "frontend" / "src" / "data" / "portfolio.json"
