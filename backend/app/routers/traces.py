import os
import logging
import asyncio
from fastapi import APIRouter, HTTPException, Header, Request
from typing import List
import re
import uuid
import aiosqlite
from datetime import datetime, timezone
from google import genai
from google.genai import types
from app.schemas import Trace, TraceCreate
from app.database import get_db_connection
from app.config import GEMINI_API_KEY
from app.utils.rate_limiter import check_rate_limit

router = APIRouter(prefix="/traces", tags=["Traces"])

logger = logging.getLogger(__name__)

# Initialize GenAI Client if API key is provided
genai_client = None
if GEMINI_API_KEY:
    try:
        genai_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Gemini Client for traces: {e}")

# Fast offline validation for basic profanity to save API calls
COMMON_PROFANITIES = {"fuck", "shit", "bitch", "asshole", "cunt", "nigger", "bastard"}

async def is_word_inappropriate(word: str) -> bool:
    word_lower = word.strip().lower()
    if word_lower in COMMON_PROFANITIES:
        return True
        
    if not genai_client:
        return False
        
    try:
        prompt = f"""You are a content moderation assistant.
Analyze the following single word submitted to a public portfolio website Guestbook ("Leave a Trace").
Determine if the word is offensive, profane, inappropriate, sexually explicit, hateful, or a common bad word.

Word to evaluate: "{word}"

Respond with exactly "SAFE" if the word is fine, or "INAPPROPRIATE" if it is bad. Do not include any other text or punctuation."""

        def call_gemini():
            response = genai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.0,
                    max_output_tokens=10,
                    thinking_config=types.ThinkingConfig(thinking_budget=0)
                )
            )
            return response.text

        result = await asyncio.to_thread(call_gemini)
        if result is None:
            # If the response text is None, it means the API safety filter blocked it,
            # which indicates the word is highly inappropriate.
            return True
            
        return "INAPPROPRIATE" in result.strip().upper()
    except Exception as e:
        logger.error(f"AI moderation failed: {e}")
        return False

WORD_RE = re.compile(r"^[A-Za-z'\-]{1,24}$")

@router.post("", response_model=Trace)
async def post_trace(input_data: TraceCreate, request: Request):
    # Limit traces creation to 5 requests per minute per IP
    check_rate_limit(request.client.host if request.client else "unknown", limit=5, window=60)

    word = (input_data.word or "").strip()
    if not word or not WORD_RE.match(word):
        raise HTTPException(status_code=400, detail="One word only, 1-24 letters.")
        
    if await is_word_inappropriate(word):
        raise HTTPException(status_code=400, detail="Inappropriate content is not allowed.")
    
    async with get_db_connection() as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, word FROM traces WHERE LOWER(word) = LOWER(?)",
            (word,)
        )
        existing = await cursor.fetchone()
        if existing:
            return Trace(id=existing["id"], word=existing["word"])
        
        trace_id = str(uuid.uuid4())
        timestamp_str = datetime.now(timezone.utc).isoformat()
        await db.execute(
            "INSERT INTO traces (id, word, timestamp) VALUES (?, ?, ?)",
            (trace_id, word, timestamp_str)
        )
        # Cap the table size to the last 1000 traces to prevent DB bloat
        await db.execute("""
            DELETE FROM traces 
            WHERE id NOT IN (
                SELECT id FROM traces 
                ORDER BY timestamp DESC 
                LIMIT 1000
            )
        """)
        await db.commit()
        
    return Trace(id=trace_id, word=word)

@router.get("", response_model=List[Trace])
async def get_traces(limit: int = 200):
    cap = max(1, min(int(limit or 200), 500))
    async with get_db_connection() as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, word FROM traces ORDER BY timestamp DESC LIMIT ?",
            (cap,)
        )
        rows = await cursor.fetchall()
        
    return [Trace(id=row["id"], word=row["word"]) for row in rows]

@router.delete("/{word}")
async def delete_trace(word: str, request: Request, x_admin_token: str = Header(None, alias="X-Admin-Token")):
    client_ip = request.client.host if request.client else "unknown"
    admin_token = os.getenv("ADMIN_TOKEN")
    if not admin_token or x_admin_token != admin_token:
        logger.warning(f"Unauthorized trace delete attempt: word='{word}' ip={client_ip}")
        raise HTTPException(status_code=401, detail="Unauthorized")

    async with get_db_connection() as db:
        cursor = await db.execute(
            "DELETE FROM traces WHERE LOWER(word) = LOWER(?)",
            (word.strip(),)
        )
        await db.commit()
        if cursor.rowcount == 0:
            logger.info(f"Trace delete (not found): word='{word}' ip={client_ip}")
            raise HTTPException(status_code=404, detail="Trace not found")

    logger.info(f"Trace deleted: word='{word}' ip={client_ip} at={datetime.now(timezone.utc).isoformat()}")
    return {"message": f"Trace '{word}' deleted successfully"}

