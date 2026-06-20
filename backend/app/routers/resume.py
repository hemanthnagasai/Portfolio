from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import io
from app.services.pdf_generator import build_resume_pdf

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.get("/download")
async def download_resume():
    pdf_bytes = build_resume_pdf()
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="Hemanth_Naga_Sai_Chakka_Resume.pdf"'
        },
    )
