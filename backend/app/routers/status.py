from fastapi import APIRouter, Request
from typing import List
from datetime import datetime
import aiosqlite
from app.schemas import StatusCheck, StatusCheckCreate
from app.database import get_db_connection
from app.utils.rate_limiter import check_rate_limit

router = APIRouter(prefix="/status", tags=["Status Checks"])

@router.post("", response_model=StatusCheck)
async def create_status_check(input_data: StatusCheckCreate, request: Request):
    # Limit status check creations to 10 requests per minute per IP
    check_rate_limit(request.client.host if request.client else "unknown", limit=10, window=60)

    status_obj = StatusCheck(**input_data.model_dump())
    timestamp_str = status_obj.timestamp.isoformat()
    async with get_db_connection() as db:
        await db.execute(
            "INSERT INTO status_checks (id, client_name, timestamp) VALUES (?, ?, ?)",
            (status_obj.id, status_obj.client_name, timestamp_str)
        )
        # Cap the table size to the last 40 status checks to prevent DB bloat
        await db.execute("""
            DELETE FROM status_checks 
            WHERE id NOT IN (
                SELECT id FROM status_checks 
                ORDER BY timestamp DESC 
                LIMIT 40
            )
        """)
        await db.commit()
    return status_obj

@router.get("", response_model=List[StatusCheck])
async def get_status_checks():
    async with get_db_connection() as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT id, client_name, timestamp FROM status_checks ORDER BY timestamp DESC")
        rows = await cursor.fetchall()
        
    checks = []
    for row in rows:
        ts = row["timestamp"]
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts)
        checks.append(
            StatusCheck(
                id=row["id"],
                client_name=row["client_name"],
                timestamp=ts
            )
        )
    return checks
