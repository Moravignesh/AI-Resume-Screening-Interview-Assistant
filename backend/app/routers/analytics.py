from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter
from app.database import get_db
from app.models import User, Candidate, JobDescription, Evaluation
from app.schemas import AnalyticsOut, CandidateOut
from app.utils.auth import require_hr

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsOut)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    total_candidates = db.query(func.count(Candidate.id)).scalar()
    total_jobs = db.query(func.count(JobDescription.id)).scalar()

    avg_match = db.query(func.avg(Evaluation.match_score)).filter(
        Evaluation.match_score.isnot(None)
    ).scalar()

    # Most requested skills from job descriptions
    all_jobs = db.query(JobDescription).all()
    skill_counter = Counter()
    for job in all_jobs:
        for skill in (job.required_skills or []):
            skill_counter[skill.lower()] += 1
    most_requested = [{"skill": s, "count": c} for s, c in skill_counter.most_common(10)]

    # Recent candidates
    recent = db.query(Candidate).order_by(Candidate.created_at.desc()).limit(5).all()

    # Most active users (by number of evaluations created)
    user_activity = (
        db.query(User.name, func.count(Evaluation.id).label("eval_count"))
        .join(Evaluation, Evaluation.created_by == User.id)
        .group_by(User.id)
        .order_by(func.count(Evaluation.id).desc())
        .limit(5)
        .all()
    )
    active_users = [{"name": u.name, "eval_count": u.eval_count} for u in user_activity]

    return AnalyticsOut(
        total_candidates=total_candidates or 0,
        total_jobs=total_jobs or 0,
        average_match_score=round(float(avg_match), 1) if avg_match else None,
        most_requested_skills=most_requested,
        recent_candidates=[CandidateOut.model_validate(c) for c in recent],
        most_active_users=active_users,
    )
