from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import create_tables
from app.config import settings
from app.routers import auth_router, candidates_router, jobs_router, ai_router, analytics_router

app = FastAPI(
    title="AI Resume Screener API",
    description="AI-powered resume screening and interview assistant",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(candidates_router)
app.include_router(jobs_router)
app.include_router(ai_router)
app.include_router(analytics_router)

# Serve uploaded files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def startup():
    create_tables()
    print("✅ Database tables created/verified")


@app.get("/")
def root():
    return {"message": "AI Resume Screener API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
