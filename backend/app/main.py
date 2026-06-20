from fastapi import FastAPI, APIRouter
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware
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

api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {"message": "Life Portfolio API"}

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
