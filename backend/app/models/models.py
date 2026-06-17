from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, ForeignKey,
    Enum, JSON, Boolean
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()


class UserRole(str, enum.Enum):
    HR = "hr"
    RECRUITER = "recruiter"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.RECRUITER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    candidates = relationship("Candidate", back_populates="uploaded_by_user")
    jobs = relationship("JobDescription", back_populates="created_by_user")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), index=True)
    phone = Column(String(50))
    skills = Column(JSON)  # list of skills
    work_experience = Column(JSON)  # list of experience dicts
    education = Column(JSON)  # list of education dicts
    raw_text = Column(Text)  # full extracted text
    file_path = Column(String(500))
    file_name = Column(String(255))
    file_type = Column(String(50))  # pdf or docx
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    uploaded_by_user = relationship("User", back_populates="candidates")
    evaluations = relationship("Evaluation", back_populates="candidate")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    required_skills = Column(JSON)  # list
    experience_requirement = Column(String(100))
    location = Column(String(255))
    employment_type = Column(String(100))
    description = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    created_by_user = relationship("User", back_populates="jobs")
    evaluations = relationship("Evaluation", back_populates="job")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=True)
    eval_type = Column(String(50))  # match, questions, summary
    match_score = Column(Float, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    interview_questions = Column(JSON, nullable=True)  # {technical, scenario, behavioral}
    summary = Column(Text, nullable=True)
    recommendation = Column(String(100), nullable=True)
    full_result = Column(JSON, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    candidate = relationship("Candidate", back_populates="evaluations")
    job = relationship("JobDescription", back_populates="evaluations")
