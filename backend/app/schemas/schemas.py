from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict
from datetime import datetime
from app.models.models import UserRole


# ─── Auth Schemas ───────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: UserRole = UserRole.RECRUITER


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ─── Candidate Schemas ───────────────────────────────────────────────────────
class CandidateOut(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    skills: Optional[List[str]]
    work_experience: Optional[List[Dict]]
    education: Optional[List[Dict]]
    file_name: Optional[str]
    file_type: Optional[str]
    uploaded_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class CandidateSearch(BaseModel):
    query: Optional[str] = None
    skills: Optional[List[str]] = None
    min_experience_years: Optional[int] = None


# ─── Job Description Schemas ─────────────────────────────────────────────────
class JobCreate(BaseModel):
    title: str
    required_skills: List[str]
    experience_requirement: Optional[str]
    location: Optional[str]
    employment_type: Optional[str]
    description: str


class JobUpdate(BaseModel):
    title: Optional[str]
    required_skills: Optional[List[str]]
    experience_requirement: Optional[str]
    location: Optional[str]
    employment_type: Optional[str]
    description: Optional[str]


class JobOut(BaseModel):
    id: int
    title: str
    required_skills: Optional[List[str]]
    experience_requirement: Optional[str]
    location: Optional[str]
    employment_type: Optional[str]
    description: Optional[str]
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── AI Schemas ───────────────────────────────────────────────────────────────
class MatchRequest(BaseModel):
    candidate_id: int
    job_id: int


class QuestionsRequest(BaseModel):
    candidate_id: int
    job_id: int


class SummaryRequest(BaseModel):
    candidate_id: int


class EvaluationOut(BaseModel):
    id: int
    candidate_id: int
    job_id: Optional[int]
    eval_type: str
    match_score: Optional[float]
    missing_skills: Optional[List[str]]
    strengths: Optional[List[str]]
    weaknesses: Optional[List[str]]
    interview_questions: Optional[Dict]
    summary: Optional[str]
    recommendation: Optional[str]
    full_result: Optional[Dict]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Analytics Schemas ────────────────────────────────────────────────────────
class AnalyticsOut(BaseModel):
    total_candidates: int
    total_jobs: int
    average_match_score: Optional[float]
    most_requested_skills: List[Dict]
    recent_candidates: List[CandidateOut]
    most_active_users: List[Dict]
