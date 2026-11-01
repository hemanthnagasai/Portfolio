import io
import json
from xml.sax.saxutils import escape

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

from app.config import PORTFOLIO_JSON_PATH


def _load_portfolio() -> dict:
    # Same portfolio.json the frontend renders and the chatbot is grounded
    # in — the resume can't drift from the site because they share one
    # source of truth.
    with open(PORTFOLIO_JSON_PATH, encoding="utf-8") as f:
        return json.load(f)


def build_resume_pdf() -> bytes:
    data = _load_portfolio()
    profile = data["profile"]
    professional = data["professional"]
    resume = data.get("resume", {})

    full_name = " ".join(
        part for part in (profile.get("firstName"), profile.get("middleName"), profile.get("lastName")) if part
    )
    experience = professional.get("experience", [])
    current_role = experience[0]["role"] if experience else ""
    education = professional.get("education", [])

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=LETTER,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
        # Slightly tighter vertical margins + section spacing (below) keep the
        # whole resume on one page; at 0.55in it spilled the last cert alone
        # onto page 2, which reads as unfinished.
        topMargin=0.45 * inch,
        bottomMargin=0.45 * inch,
        title=f"{full_name} - Resume",
        author=full_name,
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
        spaceBefore=8, spaceAfter=4, textTransform="uppercase",
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
    story.append(Paragraph(escape(full_name), name_style))
    if current_role:
        story.append(Paragraph(escape(current_role), title_style))
    contact_bits = [f"{profile['origin']}, India"] if profile.get("origin") else []
    if education:
        contact_bits.append(f"{education[0]['degree']}, {education[0].get('meta', '')}".strip(", "))
    links = profile.get("links") or {}
    for key in ("linkedin", "github"):
        if links.get(key):
            contact_bits.append(links[key].removeprefix("https://").removeprefix("www.").rstrip("/"))
    if contact_bits:
        story.append(Paragraph(escape("  |  ".join(contact_bits)), contact_style))
    story.append(HRFlowable(width="100%", thickness=0.6, color=HexColor("#D1D5DB"), spaceAfter=6))

    # Summary — resume.summary is the professional-tone variant of the
    # site's first-person bio.
    summary = resume.get("summary")
    if summary:
        story.append(Paragraph("SUMMARY", section_style))
        story.append(Paragraph(escape(summary), body_style))

    # Experience
    if experience:
        story.append(Paragraph("EXPERIENCE", section_style))
        for job in experience:
            story.append(Paragraph(escape(f"{job['role']} — {job['company']}"), role_style))
            period_line = job.get("period", "")
            if job.get("sub"):
                period_line = f"{period_line}  |  {job['sub']}" if period_line else job["sub"]
            if period_line:
                story.append(Paragraph(escape(period_line), meta_style))
            for b in job.get("bullets", []):
                story.append(Paragraph(escape(b), bullet_style, bulletText="•"))

    # Projects — resumeDesc (professional tone) preferred over the site's
    # more personal desc.
    projects = professional.get("projects", [])
    if projects:
        story.append(Paragraph("PROJECTS", section_style))
        for i, proj in enumerate(projects):
            if i > 0:
                story.append(Spacer(1, 4))
            story.append(Paragraph(escape(proj["name"]), role_style))
            if proj.get("stack"):
                story.append(Paragraph(escape(proj["stack"]), meta_style))
            desc = proj.get("resumeDesc") or proj.get("desc")
            if desc:
                story.append(Paragraph(escape(desc), bullet_style, bulletText="•"))

    # Education
    if education:
        story.append(Paragraph("EDUCATION", section_style))
        for edu in education:
            story.append(Paragraph(escape(f"{edu['degree']} — {edu['org']}"), role_style))
            meta_line = "  |  ".join(bit for bit in (edu.get("period"), edu.get("meta")) if bit)
            if meta_line:
                story.append(Paragraph(escape(meta_line), meta_style))

    # Skills
    skills = professional.get("skills", [])
    if skills:
        story.append(Paragraph("SKILLS", section_style))
        story.append(Paragraph(escape(" • ".join(skills)), body_style))

    # Certifications & achievements
    certs = professional.get("certs", [])
    if certs:
        story.append(Paragraph("CERTIFICATIONS &amp; ACHIEVEMENTS", section_style))
        for cert in certs:
            line = f"{cert['name']} — {cert['org']}" if cert.get("org") else cert["name"]
            story.append(Paragraph(escape(line), bullet_style, bulletText="•"))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
