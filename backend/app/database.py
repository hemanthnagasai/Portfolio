import aiosqlite
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "portfolio.db"

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS status_checks (
                id TEXT PRIMARY KEY,
                client_name TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS traces (
                id TEXT PRIMARY KEY,
                word TEXT NOT NULL UNIQUE,
                timestamp TEXT NOT NULL
            )
        """)
        await db.commit()

def get_db_connection():
    return aiosqlite.connect(DB_PATH)
