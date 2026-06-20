from fastapi import APIRouter, HTTPException, Request
import json
import logging
from google import genai
from google.genai import types
from app.schemas import ChatRequest, ChatResponse
from app.config import GEMINI_API_KEY, PORTFOLIO_JSON_PATH
from app.utils.rate_limiter import check_rate_limit

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = logging.getLogger(__name__)

genai_client = None
if GEMINI_API_KEY:
    try:
        genai_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Gemini Client: {e}")

portfolio_data = {}
if PORTFOLIO_JSON_PATH.exists():
    try:
        with open(PORTFOLIO_JSON_PATH, "r", encoding="utf-8") as f:
            portfolio_data = json.load(f)
    except Exception as e:
        logger.error(f"Failed to load portfolio.json: {e}")

def get_genai_client():
    global genai_client
    if genai_client is None and GEMINI_API_KEY:
        try:
            genai_client = genai.Client(api_key=GEMINI_API_KEY)
        except Exception as e:
            logger.error(f"Failed to initialize Gemini Client: {e}")
    return genai_client

@router.post("", response_model=ChatResponse)
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
    for msg in input_data.history:
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
        if PORTFOLIO_JSON_PATH.exists():
            try:
                with open(PORTFOLIO_JSON_PATH, "r", encoding="utf-8") as f:
                    portfolio_data = json.load(f)
            except Exception as e:
                logger.error(f"Failed to load portfolio.json: {e}")

    system_instruction = f"""
You are Hemanth Naga Sai Chakka. You speak in the first person ("I", "me", "my").
You are a Senior Data Analyst at EY (Ernst & Young LLP).
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
   - Ernst & Young (EY): You work there as a Senior Data Analyst (joined as intern in June 2024, full-time from December 2024). You automate Excel workflows with Python and validate client data.
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

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            )
        )
        return ChatResponse(response=response.text or "")
    except Exception as e:
        logger.warning(f"Gemini 2.5 Flash model failed or unavailable: {e}. Trying fallback model gemini-1.5-flash.")
        try:
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7,
                )
            )
            return ChatResponse(response=response.text or "")
        except Exception as e2:
            logger.error(f"All Gemini models failed to generate content: {e2}")
            raise HTTPException(status_code=500, detail=f"Generation failed: {str(e2)}")
