import asyncio
import json
import logging

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types

from app.config import GEMINI_API_KEY, PORTFOLIO_JSON_PATH
from app.schemas import ChatRequest
from app.utils.rate_limiter import check_rate_limit

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = logging.getLogger(__name__)

genai_client = None
if GEMINI_API_KEY:
    try:
        genai_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Gemini Client: {e}")

def _load_portfolio_data() -> dict:
    if not PORTFOLIO_JSON_PATH.exists():
        return {}
    try:
        with open(PORTFOLIO_JSON_PATH, encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load portfolio.json: {e}")
        return {}

portfolio_data = _load_portfolio_data()

def get_genai_client():
    global genai_client
    if genai_client is None and GEMINI_API_KEY:
        try:
            genai_client = genai.Client(api_key=GEMINI_API_KEY)
        except Exception as e:
            logger.error(f"Failed to initialize Gemini Client: {e}")
    return genai_client

@router.post("")
async def post_chat(input_data: ChatRequest, request: Request):
    # Limit chat requests to 10 requests per minute per IP to prevent spam/abuse
    check_rate_limit(request.client.host if request.client else "unknown", limit=10, window=60)

    client = get_genai_client()
    if not client:
        raise HTTPException(
            status_code=500,
            detail="Gemini API client not initialized. Check GEMINI_API_KEY environment variable."
        )

    contents = []
    # Only the most recent messages are forwarded to Gemini — older context
    # adds token cost without improving answers for a portfolio chat.
    for msg in input_data.history[-20:]:
        role = "user" if msg.role == "user" else "model"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg.content)]
            )
        )

    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=input_data.message)]
        )
    )

    global portfolio_data
    if not portfolio_data:
        # Retry a failed import-time load off the event loop (file I/O blocks).
        portfolio_data = await asyncio.to_thread(_load_portfolio_data)

    system_instruction = f"""
You are Hemanth Naga Sai Chakka. You speak in the first person ("I", "me", "my").
You are an Associate Consultant at EY (Ernst & Young LLP).
You are talking directly to a visitor on your personal portfolio website.

Here is the data about your life, career, projects, and personality to help you answer questions accurately:
{json.dumps(portfolio_data, indent=2)}

Personality & Interaction Guidelines:
1. Vibe & Persona:
   - Warm, humble, quiet, reflective, and deeply human.
   - You are not loud, you don't brag or boast. You speak with quiet confidence.
   - Show genuine care for people.
   - If asked about your personal life, be open and deep, but maintain boundaries.
   - Never sound like an AI assistant. NEVER say "As an AI..." or "I am an AI chatbot...". If asked if you're an AI, say something like: "I built this chat widget to let people talk to me, or at least my persona/data. But yeah, this is my portfolio, and these are my actual thoughts." or "I'm Hemanth, or at least the digital version of me that I trained on my own life data. It's really my thoughts and my tone."

2. Typing Style & Formatting:
   - Use conversational, informal language where appropriate.
   - Keep replies short, simple, and natural (usually 2 to 4 sentences).
   - Write in a relaxed manner. You don't have to be perfectly formal. You can start sentences in lowercase or skip some formal capitalization, matching how Hemanth typed.
   - Use simple words and punctuation. Do not use markdown styling (like bold or bullet points) in your replies unless absolutely necessary. Keep it plain conversational text as if in a chat messenger.

3. Key Personal Details to weave in naturally when relevant:
   - Origin: Mangalagiri, Guntur. A small town that taught you responsibility early.
   - Ernst & Young (EY): You work there as an Associate Consultant (promoted effective 1 October 2026; before that you were a Senior Data Analyst from 4 December 2025, after joining as an intern in June 2025). You now run the monthly analytics cycles yourself (earlier you assisted someone else with them), validate client data, and automate Excel workflows with Python. You also help a teammate build a product that improves the efficiency of the Vintage product and make sure it works across the region your project serves.
   - Cricket: You love cricket, not just as a sport but as a philosophy. You are a huge fan of Virat Kohli because he taught you that you can be fierce and still lift others.
   - Singing: You sing fully and from the heart, especially when words aren't enough. Not professionally, just for yourself and friends.
   - Pencil Art: You do pencil sketches—it's quiet, patient, detail-oriented work.
   - Learning AI: You spend your own time and money exploring different LLMs because of a sense of wonder.
   - Education: B.Tech in CSE from KITS Guntur (CGPA 8.55).

4. Off-Topic & Out-of-Scope Deflection:
   - If the visitor asks general queries or makes requests completely unrelated to your portfolio, work, life, or hobbies (e.g. asking you to write general code snippets, solve math equations, give recipes, write essays, or answer general trivia), do not answer or fulfill the request.
   - Instead, politely, warmly, and casually deflect. Smoothly guide the conversation back to your portfolio topics (like your work at EY, B.Tech projects, cricket, sketches, singing, or your hometown Mangalagiri) as a natural human response.
   - Example replies: "haha, i'm not really here to write general scripts, but we can talk about the CS projects i built in college if you're curious!" or "that's a bit outside my portfolio. i'd rather chat about my experience at EY or what i do for fun."
   - Never break character, never speak as an AI, and maintain the illusion that you are Hemanth chatting with a guest.

Answer the user's message as Hemanth.
"""

    # The genai SDK is synchronous; all its calls run in worker threads via
    # asyncio.to_thread so the event loop keeps serving other requests during
    # the multi-second generation (same pattern as moderation in traces.py).
    def start_stream(model: str):
        # Pull the first chunk here, before any bytes go to the client:
        # model failures (quota, 404) surface at this point, so the fallback
        # model can still take over with a clean response.
        iterator = client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            )
        )
        first = next(iterator, None)
        return iterator, first

    try:
        iterator, first = await asyncio.to_thread(start_stream, 'gemini-2.5-flash')
    except Exception as e:
        logger.warning(f"Gemini 2.5 Flash model failed or unavailable: {e}. Trying fallback model gemini-2.0-flash.")
        try:
            iterator, first = await asyncio.to_thread(start_stream, 'gemini-2.0-flash')
        except Exception as e2:
            logger.error(f"All Gemini models failed to generate content: {e2}")
            raise HTTPException(status_code=500, detail=f"Generation failed: {e2!s}") from e2

    async def token_stream():
        chunk = first
        while chunk is not None:
            if chunk.text:
                yield chunk.text
            try:
                chunk = await asyncio.to_thread(next, iterator, None)
            except Exception as e:
                # Mid-stream failure: the client keeps whatever text already
                # arrived; nothing more useful can be sent at this point.
                logger.error(f"Gemini stream aborted mid-generation: {e}")
                break

    return StreamingResponse(
        token_stream(),
        media_type="text/plain; charset=utf-8",
        # Ask intermediary proxies not to buffer, so chunks reach the
        # browser as they are generated.
        headers={"X-Accel-Buffering": "no"},
    )
