import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from app.database import get_db
from app.models import User, Candidate
from app.schemas import CandidateOut
from app.utils.auth import get_current_user, require_hr
from app.utils.resume_parser import parse_resume
from app.services import ai_extract_resume_info
from app.config import settings

router = APIRouter(prefix="/candidates", tags=["Candidates"])

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
}


@router.post("/upload", response_model=CandidateOut, status_code=201)
async def upload_candidate(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    content_type = file.content_type
    file_ext = ALLOWED_TYPES.get(content_type)
    if not file_ext:
        # Try by extension
        fname = file.filename or ""
        if fname.endswith(".pdf"):
            file_ext = "pdf"
        elif fname.endswith(".docx"):
            file_ext = "docx"
        else:
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")

    # Save file
    unique_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Parse resume
    parsed = parse_resume(file_path, file_ext)

    # Enhance with Gemini AI extraction
    ai_data = ai_extract_resume_info(parsed["raw_text"])

    # Merge: AI data takes priority for structured fields
    name = ai_data.get("name") or parsed["name"] or "Unknown"
    email = ai_data.get("email") or parsed["email"] or ""
    phone = ai_data.get("phone") or parsed["phone"] or ""
    skills = ai_data.get("skills") or parsed["skills"] or []
    work_experience = ai_data.get("work_experience") or parsed["work_experience"] or []
    education = ai_data.get("education") or parsed["education"] or []

    candidate = Candidate(
        name=name,
        email=email,
        phone=phone,
        skills=skills,
        work_experience=work_experience,
        education=education,
        raw_text=parsed["raw_text"],
        file_path=file_path,
        file_name=file.filename,
        file_type=file_ext,
        uploaded_by=current_user.id,
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


@router.get("", response_model=List[CandidateOut])
def get_candidates(
    search: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Candidate)

    if search:
        query = query.filter(
            or_(
                Candidate.name.ilike(f"%{search}%"),
                Candidate.email.ilike(f"%{search}%"),
            )
        )

    if skill:
        # JSON contains search — using raw SQL for MySQL JSON
        query = query.filter(
            func.json_search(Candidate.skills, "one", f"%{skill.lower()}%").isnot(None)
        )

    return query.offset(skip).limit(limit).all()


@router.get("/{candidate_id}", response_model=CandidateOut)
def get_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return c


@router.delete("/{candidate_id}", status_code=204)
def delete_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Remove file
    if c.file_path and os.path.exists(c.file_path):
        os.remove(c.file_path)

    db.delete(c)
    db.commit()
