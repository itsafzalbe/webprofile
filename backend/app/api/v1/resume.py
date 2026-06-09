import os
from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import FileResponse
from app.utils.rate_limiter import limiter

router = APIRouter(prefix="/resume", tags=["resume"])
RESUME_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "static", "Resume.docx.pdf")

@router.get("/download")
@limiter.limit("10/hour")
async def download_resume(request: Request,):
    abs_path = os.path.abspath(RESUME_PATH)
    if not os.path.exists(abs_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume file not found.",
        )
    return FileResponse(
        path=abs_path,
        media_type="application/pdf",
        filename="Afzalbek_Resume.pdf",
    )

@router.get("/info")
@limiter.limit("10/minute")
async def resume_info(request: Request,):
    abs_path = os.path.abspath(RESUME_PATH)
    if not os.path.exists(abs_path):
        return {"available": False, "message": "Resume not uploaded yet"}
    
    size_kb = round(os.path.getsize(abs_path)/1024, 1)
    modified = os.path.getmtime(abs_path)
    from datetime import datetime
    modified_date = datetime.fromtimestamp(modified).strftime("%Y-%m-%d")

    return {
        "available": True,
        "filename": "Afzalbek_Resume.pdf",
        "size_kb": size_kb,
        "last_updated": modified_date,
    }