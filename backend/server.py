from fastapi import FastAPI, APIRouter
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import io
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    HRFlowable,
    KeepTogether,
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


@api_router.get("/")
async def root():
    return {"message": "Life Portfolio API"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# --------- Traces (Leave a trace guestbook) ---------

class TraceCreate(BaseModel):
    word: str


class Trace(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    word: str


import re as _re
_WORD_RE = _re.compile(r"^[A-Za-z'\-]{1,24}$")


@api_router.post("/traces", response_model=Trace)
async def post_trace(input: TraceCreate):
    from fastapi import HTTPException
    word = (input.word or "").strip()
    if not word or not _WORD_RE.match(word):
        raise HTTPException(status_code=400, detail="One word only, 1-24 letters.")
    doc = {
        "id": str(uuid.uuid4()),
        "word": word,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.traces.insert_one(doc)
    return Trace(id=doc["id"], word=doc["word"])


@api_router.get("/traces", response_model=List[Trace])
async def get_traces(limit: int = 200):
    cap = max(1, min(int(limit or 200), 500))
    cursor = db.traces.find({}, {"_id": 0, "id": 1, "word": 1}).sort("timestamp", -1).limit(cap)
    docs = await cursor.to_list(cap)
    return [Trace(id=d["id"], word=d["word"]) for d in docs]


# --------- Resume PDF (ATS-friendly) ---------

def _build_resume_pdf() -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=LETTER,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.55 * inch,
        title="Hemanth Naga Sai Chakka - Resume",
        author="Hemanth Naga Sai Chakka",
    )

    styles = getSampleStyleSheet()
    dark = HexColor("#111827")
    muted = HexColor("#4B5563")
    accent = HexColor("#000000")

    name_style = ParagraphStyle(
        "Name", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=20, leading=24, textColor=dark, alignment=TA_LEFT, spaceAfter=2,
    )
    title_style = ParagraphStyle(
        "Title", parent=styles["Normal"], fontName="Helvetica",
        fontSize=11, leading=14, textColor=muted, alignment=TA_LEFT, spaceAfter=2,
    )
    contact_style = ParagraphStyle(
        "Contact", parent=styles["Normal"], fontName="Helvetica",
        fontSize=9.5, leading=13, textColor=muted, alignment=TA_LEFT, spaceAfter=8,
    )
    section_style = ParagraphStyle(
        "Section", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=11, leading=14, textColor=accent, alignment=TA_LEFT,
        spaceBefore=10, spaceAfter=4, textTransform="uppercase",
    )
    body_style = ParagraphStyle(
        "Body", parent=styles["Normal"], fontName="Helvetica",
        fontSize=10, leading=14, textColor=dark, alignment=TA_LEFT, spaceAfter=2,
    )
    role_style = ParagraphStyle(
        "Role", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=10.5, leading=14, textColor=dark, alignment=TA_LEFT, spaceAfter=1,
    )
    meta_style = ParagraphStyle(
        "Meta", parent=styles["Normal"], fontName="Helvetica-Oblique",
        fontSize=9.5, leading=12, textColor=muted, alignment=TA_LEFT, spaceAfter=4,
    )
    bullet_style = ParagraphStyle(
        "Bullet", parent=styles["Normal"], fontName="Helvetica",
        fontSize=10, leading=13.5, textColor=dark, alignment=TA_LEFT,
        leftIndent=12, bulletIndent=2, spaceAfter=1,
    )

    story = []
    story.append(Paragraph("Hemanth Naga Sai Chakka", name_style))
    story.append(Paragraph("Senior Data Analyst", title_style))
    story.append(Paragraph(
        "Mangalagiri, Guntur, India  &nbsp;|&nbsp;  B.Tech Computer Science Engineering, CGPA 8.55",
        contact_style,
    ))
    story.append(HRFlowable(width="100%", thickness=0.6, color=HexColor("#D1D5DB"), spaceAfter=6))

    # Summary
    story.append(Paragraph("SUMMARY", section_style))
    story.append(Paragraph(
        "Senior Data Analyst at EY working at the intersection of data, technology, and people. "
        "Translate complexity into clarity, automate repetitive workflows, and leverage GenAI to "
        "simplify complex findings for non-technical stakeholders.",
        body_style,
    ))

    # Experience
    story.append(Paragraph("EXPERIENCE", section_style))
    story.append(Paragraph("Senior Data Analyst — Ernst &amp; Young LLP (EY)", role_style))
    story.append(Paragraph("Dec 2024 – Present  |  Intern: Jun 2024 – Dec 2024", meta_style))
    for b in [
        "Validate and reconcile client data across multiple enterprise platforms, ensuring accuracy and consistency.",
        "Execute monthly runs for an internally developed analytics and reporting tool used by client teams.",
        "Automate repetitive Excel workflows using Python — reducing manual effort without being asked.",
        "Leverage GenAI tools to simplify complex report findings for non-technical end users.",
    ]:
        story.append(Paragraph(b, bullet_style, bulletText="•"))

    # Projects
    story.append(Paragraph("PROJECTS", section_style))
    story.append(Paragraph("Attendance Management System", role_style))
    story.append(Paragraph("Python, OpenCV, Facial Recognition", meta_style))
    story.append(Paragraph(
        "Built with a team during B.Tech. Automated real-time attendance marking using facial capture, "
        "eliminating manual intervention.",
        bullet_style, bulletText="•",
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Emotion Detection &amp; Analysis", role_style))
    story.append(Paragraph("Python, Facial Recognition APIs, Emotion Libraries", meta_style))
    story.append(Paragraph(
        "Designed a model that reads human emotions in real time; integrated with a drone delivery system "
        "to supply items to employees based on their emotional state.",
        bullet_style, bulletText="•",
    ))

    # Education
    story.append(Paragraph("EDUCATION", section_style))
    story.append(Paragraph("B.Tech, Computer Science Engineering — KITS, Guntur", role_style))
    story.append(Paragraph("2021 – 2025  |  CGPA 8.55", meta_style))
    story.append(Paragraph("Intermediate (XII), Science — Sri Gayathri Jr. College", role_style))
    story.append(Paragraph("2021  |  87.8%", meta_style))
    story.append(Paragraph("Secondary (X) — Ravindra Bharati School", role_style))
    story.append(Paragraph("2019  |  9.50 GPA", meta_style))

    # Skills
    story.append(Paragraph("SKILLS", section_style))
    skills = [
        "Python", "SQL", "Excel", "NumPy", "Pandas", "Matplotlib",
        "Machine Learning", "NLP", "MongoDB", "GenAI Tools",
        "Data Validation", "Process Automation", "LLM Exploration",
    ]
    story.append(Paragraph(" • ".join(skills), body_style))

    # Certifications
    story.append(Paragraph("CERTIFICATIONS &amp; ACHIEVEMENTS", section_style))
    for b in [
        "Basic Python — HackerRank",
        "Artificial Intelligence — Simplilearn",
        "Generative AI for Everyone — Coursera",
        "Data Analytics — Code Crave, Startup Mahakumbh 2024 (Delhi)",
        "IIC Regional Meet — High Recognition",
        "Jeevan Kaushal Club Coordinator (Co-Curricular)",
    ]:
        story.append(Paragraph(b, bullet_style, bulletText="•"))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()


@api_router.get("/resume/download")
async def download_resume():
    pdf_bytes = _build_resume_pdf()
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="Hemanth_Naga_Sai_Chakka_Resume.pdf"'
        },
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
