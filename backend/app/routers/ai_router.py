from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Candidate, JobDescription, Evaluation
from app.schemas import MatchRequest, QuestionsRequest, SummaryRequest, EvaluationOut
from app.utils.auth import get_current_user
from app.services import ai_match_resume, ai_generate_questions, ai_generate_summary

router = APIRouter(prefix="/ai", tags=["AI Features"])


def _get_candidate_or_404(candidate_id: int, db: Session) -> Candidate:
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return c


def _get_job_or_404(job_id: int, db: Session) -> JobDescription:
    j = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Job not found")
    return j


def _exp_text(candidate: Candidate) -> str:
    exp = candidate.work_experience or []
    parts = []
    for e in exp:
        if isinstance(e, dict):
            parts.append(
                f"{e.get('role', '')} at {e.get('company', '')} ({e.get('duration', '')}) - {e.get('description', '')} {e.get('raw', '')}"
            )
    return ". ".join(parts) if parts else (candidate.raw_text or "")[:500]


def _edu_text(candidate: Candidate) -> str:
    edu = candidate.education or []
    parts = []
    for e in edu:
        if isinstance(e, dict):
            parts.append(
                f"{e.get('degree', '')} from {e.get('institution', '')} ({e.get('year', '')})"
            )
    return ". ".join(parts) if parts else ""


@router.post("/match", response_model=EvaluationOut)
def match_resume(
    req: MatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    candidate = _get_candidate_or_404(req.candidate_id, db)
    job = _get_job_or_404(req.job_id, db)

    result = ai_match_resume(
        candidate_name=candidate.name,
        candidate_skills=candidate.skills or [],
        candidate_experience=_exp_text(candidate),
        job_title=job.title,
        job_required_skills=job.required_skills or [],
        job_description=job.description or "",
        job_experience_req=job.experience_requirement or "",
    )

    eval_record = Evaluation(
        candidate_id=candidate.id,
        job_id=job.id,
        eval_type="match",
        match_score=result.get("match_score"),
        missing_skills=result.get("missing_skills", []),
        strengths=result.get("strengths", []),
        weaknesses=result.get("weaknesses", []),
        full_result=result,
        created_by=current_user.id,
    )
    db.add(eval_record)
    db.commit()
    db.refresh(eval_record)
    return eval_record


@router.post("/questions", response_model=EvaluationOut)
def generate_questions(
    req: QuestionsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    candidate = _get_candidate_or_404(req.candidate_id, db)
    job = _get_job_or_404(req.job_id, db)

    result = ai_generate_questions(
        candidate_name=candidate.name,
        candidate_skills=candidate.skills or [],
        candidate_experience=_exp_text(candidate),
        job_title=job.title,
        job_description=job.description or "",
    )

    eval_record = Evaluation(
        candidate_id=candidate.id,
        job_id=job.id,
        eval_type="questions",
        interview_questions=result,
        full_result=result,
        created_by=current_user.id,
    )
    db.add(eval_record)
    db.commit()
    db.refresh(eval_record)
    return eval_record


@router.post("/summary", response_model=EvaluationOut)
def generate_summary(
    req: SummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    candidate = _get_candidate_or_404(req.candidate_id, db)

    result = ai_generate_summary(
        candidate_name=candidate.name,
        candidate_skills=candidate.skills or [],
        candidate_experience=_exp_text(candidate),
        candidate_education=_edu_text(candidate),
        candidate_email=candidate.email or "",
    )

    eval_record = Evaluation(
        candidate_id=candidate.id,
        eval_type="summary",
        summary=result.get("overview"),
        recommendation=result.get("hiring_recommendation"),
        full_result=result,
        created_by=current_user.id,
    )
    db.add(eval_record)
    db.commit()
    db.refresh(eval_record)
    return eval_record


@router.get("/evaluations/{candidate_id}", response_model=List[EvaluationOut])
def get_evaluations(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Evaluation)
        .filter(Evaluation.candidate_id == candidate_id)
        .order_by(Evaluation.created_at.desc())
        .all()
    )
