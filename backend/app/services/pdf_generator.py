import io
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
)

def build_resume_pdf() -> bytes:
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
