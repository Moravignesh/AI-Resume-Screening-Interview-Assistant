# 🤖 AI Resume Screener

> An AI-powered resume screening and interview assistant built with **FastAPI**, **React**, **MySQL**, and **Google Gemini AI**.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [How to Get a Gemini API Key (Free)](#how-to-get-a-gemini-api-key-free)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Local Setup (Step-by-Step)](#local-setup-step-by-step)
6. [Environment Variables](#environment-variables)
7. [API Documentation](#api-documentation)
8. [Architecture Overview](#architecture-overview)
9. [Database Design](#database-design)
10. [AI Workflow](#ai-workflow)
11. [Role-Based Access](#role-based-access)
12. [Docker Setup](#docker-setup)
13. [Deployment Instructions](#deployment-instructions)

---
### Demo Videos

Frontend Demo Video : https://drive.google.com/file/d/1XSenz8LNY3WOxbd526S4Sq46yGJbeB4G/view?usp=sharing

Backend Demo vedio : https://drive.google.com/file/d/1ox1uJAT4cV-j9FxhAY6Bvlgus8ZQtjy4/view?usp=sharing
## Project Overview

The AI Resume Screener helps recruiters and HR teams:
- **Upload** PDF and DOCX resumes — text is extracted automatically
- **Match** candidates against job descriptions with an AI-generated score
- **Generate** tailored interview questions (technical, scenario, behavioral)
- **Summarise** candidates and receive a hiring recommendation
- **Manage** job descriptions with CRUD operations
- **Analyse** platform-wide hiring metrics on a dashboard

---

## How to Get a Gemini API Key (Free)

Gemini 1.5 Flash is **completely free** for development use.

**Step-by-step:**

1. Go to **https://aistudio.google.com/**
2. Sign in with your Google account
3. Click **"Get API key"** in the left sidebar
4. Click **"Create API key"** → choose **"Create API key in new project"**
5. Copy the key — it starts with `AIza...`
6. Paste it into your `.env` file:
   ```
   GEMINI_API_KEY=AIzaSy...your-key-here
   ```

> **Free tier limits:** 15 requests/minute, 1 million tokens/day — plenty for development.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python 3.11, FastAPI, Uvicorn       |
| Database  | MySQL 8.0, SQLAlchemy 2.0           |
| AI        | Google Gemini 1.5 Flash (free tier) |
| Auth      | JWT (python-jose), bcrypt           |
| Frontend  | React 18, React Router v6           |
| Charts    | Recharts                            |
| File Upload | react-dropzone                    |
| Parsing   | PyPDF2, python-docx                 |
| Container | Docker, Docker Compose              |
| CI/CD     | GitHub Actions                      |

---

## Project Structure

```
ai-resume-screener/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── config.py          # Settings from .env
│   │   ├── database.py        # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   └── models.py      # ORM models (User, Candidate, Job, Evaluation)
│   │   ├── schemas/
│   │   │   └── schemas.py     # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── auth.py        # POST /auth/register, /auth/login
│   │   │   ├── candidates.py  # CRUD + file upload
│   │   │   ├── jobs.py        # CRUD for job descriptions
│   │   │   ├── ai_router.py   # AI match, questions, summary
│   │   │   └── analytics.py   # GET /analytics
│   │   ├── services/
│   │   │   └── gemini_service.py  # All Gemini AI calls
│   │   └── utils/
│   │       ├── auth.py        # JWT helpers, password hashing
│   │       └── resume_parser.py   # PDF/DOCX text extraction
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── run.py
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── index.js           # ReactDOM entry
│   │   ├── index.css          # Global design system
│   │   ├── App.jsx            # Router + protected routes
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js         # Axios instance + all API calls
│   │   ├── components/layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Candidates.jsx
│   │       ├── CandidateDetail.jsx
│   │       ├── Jobs.jsx
│   │       ├── AITools.jsx
│   │       └── Analytics.jsx
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── database/
│   └── schema.sql
├── docker-compose.yml
└── README.md
```

---

## Local Setup (Step-by-Step)

### Prerequisites
- **Python 3.10+** — https://python.org
- **Node.js 18+** — https://nodejs.org
- **MySQL 8.0** — https://dev.mysql.com/downloads/ (or use XAMPP/Laragon)
- **VSCode** — https://code.visualstudio.com

---

### Step 1 — Clone / Open the project

```bash
# If using git:
git clone https://github.com/yourname/ai-resume-screener.git
cd ai-resume-screener

# Or just open the folder in VSCode:
# File → Open Folder → select ai-resume-screener
```

---

### Step 2 — Create MySQL Database

Option A — MySQL command line:
```sql
mysql -u root -p
CREATE DATABASE ai_resume_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Option B — Run the schema file:
```bash
mysql -u root -p < database/schema.sql
```

Option C — Use phpMyAdmin (XAMPP):  
Open http://localhost/phpmyadmin → New → Name it `ai_resume_db` → Create

---

### Step 3 — Backend Setup

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and edit the environment file
copy .env.example .env        # Windows
# OR
cp .env.example .env          # Mac/Linux
```

Now open `backend/.env` and fill in your values:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/ai_resume_db
SECRET_KEY=any-random-32-character-string-here-changeme
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
GEMINI_API_KEY=AIzaSy...your-gemini-key
UPLOAD_DIR=uploads
```

Start the backend:
```bash
python run.py
```

✅ Backend running at: **http://localhost:8000**  
📖 Swagger docs at: **http://localhost:8000/docs**

---

### Step 4 — Frontend Setup

Open a **new terminal** in VSCode:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm start
```

✅ Frontend running at: **http://localhost:3000**

---

### Step 5 — Create your first account

1. Open http://localhost:3000
2. Click **"Create one"** to register
3. Choose role **HR Manager** (HR can upload resumes and manage everything)
4. Log in and start using the app!

---

## Environment Variables

| Variable                    | Description                            | Example                          |
|-----------------------------|----------------------------------------|----------------------------------|
| `DATABASE_URL`              | MySQL connection string                | `mysql+pymysql://root:pw@localhost:3306/ai_resume_db` |
| `SECRET_KEY`                | JWT signing secret (min 32 chars)      | `my-super-secret-key-abc123xyz`  |
| `ALGORITHM`                 | JWT algorithm                          | `HS256`                          |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes            | `60`                             |
| `GEMINI_API_KEY`            | Google AI Studio API key               | `AIzaSy...`                      |
| `UPLOAD_DIR`                | Directory to store uploaded files      | `uploads`                        |

---

## API Documentation

Full interactive docs available at **http://localhost:8000/docs** when the backend is running.

### Authentication

| Method | Endpoint         | Description          | Auth Required |
|--------|-----------------|----------------------|---------------|
| POST   | `/auth/register` | Register new user    | No            |
| POST   | `/auth/login`    | Login, returns JWT   | No            |
| GET    | `/auth/me`       | Get current user     | Yes           |

**Register body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "password": "secret123",
  "role": "hr"
}
```

**Login response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": 1, "name": "Jane Smith", "role": "hr", ... }
}
```

---

### Candidates

| Method | Endpoint                 | Description                | Role      |
|--------|--------------------------|----------------------------|-----------|
| POST   | `/candidates/upload`     | Upload PDF/DOCX resume     | HR        |
| GET    | `/candidates`            | List all candidates        | Any       |
| GET    | `/candidates/{id}`       | Get candidate by ID        | Any       |
| DELETE | `/candidates/{id}`       | Delete candidate           | HR        |

**Upload:** Send as `multipart/form-data` with field `file`.

**Query params for GET /candidates:**
- `search` — filter by name/email
- `skill` — filter by skill keyword
- `skip`, `limit` — pagination

---

### Job Descriptions

| Method | Endpoint       | Description             | Role |
|--------|----------------|-------------------------|------|
| POST   | `/jobs`        | Create job description  | HR   |
| GET    | `/jobs`        | List all jobs           | Any  |
| GET    | `/jobs/{id}`   | Get job by ID           | Any  |
| PUT    | `/jobs/{id}`   | Update job              | HR   |
| DELETE | `/jobs/{id}`   | Delete job              | HR   |

**Create job body:**
```json
{
  "title": "Senior Python Developer",
  "required_skills": ["Python", "FastAPI", "MySQL", "Docker"],
  "experience_requirement": "3+ years",
  "location": "Remote",
  "employment_type": "Full-time",
  "description": "We are looking for..."
}
```

---

### AI Features

| Method | Endpoint                          | Description                    | Role |
|--------|-----------------------------------|--------------------------------|------|
| POST   | `/ai/match`                       | Match resume to job            | Any  |
| POST   | `/ai/questions`                   | Generate interview questions   | Any  |
| POST   | `/ai/summary`                     | Generate candidate summary     | Any  |
| GET    | `/ai/evaluations/{candidate_id}`  | Get evaluation history         | Any  |

**Match request:**
```json
{ "candidate_id": 1, "job_id": 2 }
```

**Match response includes:**
```json
{
  "match_score": 78.5,
  "missing_skills": ["Docker", "Kubernetes"],
  "strengths": ["Strong Python skills", "FastAPI experience"],
  "weaknesses": ["No cloud experience"],
  "full_result": { "is_suitable": true, "reasoning": "..." }
}
```

---

### Analytics (HR only)

| Method | Endpoint      | Description              |
|--------|---------------|--------------------------|
| GET    | `/analytics`  | Platform-wide metrics    |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│   React SPA (port 3000)                                     │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│   │Dashboard │ │Candidates│ │  Jobs    │ │  AI Tools   │  │
│   └──────────┘ └──────────┘ └──────────┘ └─────────────┘  │
│         │              Axios HTTP requests                   │
└─────────┼───────────────────────────────────────────────────┘
          │ JWT in Authorization header
          ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (port 8000)                    │
│                                                             │
│  ┌───────────┐  ┌────────────┐  ┌─────────────┐           │
│  │Auth Router│  │Cand. Router│  │ Jobs Router │           │
│  └───────────┘  └────────────┘  └─────────────┘           │
│  ┌────────────────────────────────────────────┐            │
│  │              AI Router                     │            │
│  │  match() → questions() → summary()         │            │
│  └──────────────────────┬─────────────────────┘            │
│                         │                                   │
│  ┌──────────────────────▼─────────────────────┐            │
│  │          Gemini Service Layer              │            │
│  │  gemini-1.5-flash API calls + JSON parse   │            │
│  └──────────────────────┬─────────────────────┘            │
│                         │ HTTPS                             │
└─────────────────────────┼───────────────────────────────────┘
                          │
          ┌───────────────▼──────────────┐
          │    Google Gemini AI API      │
          │  gemini-1.5-flash (free)     │
          └──────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           MySQL Database (port 3306)                        │
│  users │ candidates │ job_descriptions │ evaluations        │
└─────────────────────────────────────────────────────────────┘
```

**Request flow for AI match:**
1. React sends `POST /ai/match { candidate_id, job_id }`
2. FastAPI validates JWT, fetches Candidate + Job from MySQL
3. Constructs a detailed prompt with resume and job data
4. Sends prompt to Gemini 1.5 Flash API
5. Parses JSON response (score, missing skills, strengths)
6. Saves evaluation record to MySQL
7. Returns structured result to React

---

## Database Design

### Entity Relationship

```
users (1) ──< candidates (many)      [uploaded_by]
users (1) ──< job_descriptions (many) [created_by]
users (1) ──< evaluations (many)     [created_by]
candidates (1) ──< evaluations (many)
job_descriptions (1) ──< evaluations (many)
```

### Table Summary

**users** — Authentication and role management  
Columns: `id, name, email, hashed_password, role (hr|recruiter), is_active, created_at`

**candidates** — Resume data extracted from uploaded files  
Columns: `id, name, email, phone, skills (JSON array), work_experience (JSON), education (JSON), raw_text, file_path, file_name, file_type, uploaded_by, created_at`

**job_descriptions** — Open positions  
Columns: `id, title, required_skills (JSON array), experience_requirement, location, employment_type, description, created_by, created_at, updated_at`

**evaluations** — All AI-generated analyses (match, questions, summary)  
Columns: `id, candidate_id, job_id, eval_type, match_score, missing_skills (JSON), strengths (JSON), weaknesses (JSON), interview_questions (JSON), summary, recommendation, full_result (JSON), created_by, created_at`

### Why JSON columns?
Skills, experience, and education are variable-length arrays that differ per candidate. Storing them as JSON in MySQL 8.0 gives flexibility while keeping querying simple. Evaluations use JSON to store the full AI response for audit purposes.

---

## AI Workflow

### Resume Processing Pipeline

```
Upload PDF/DOCX
       │
       ▼
PyPDF2 / python-docx  ──→  raw_text extracted
       │
       ▼
Basic regex parsing        name, email, phone, skills (keyword match)
       │
       ▼
Gemini AI extraction       Structured JSON: name, skills, experience, education
       │                   (AI result takes priority over regex)
       ▼
Saved to MySQL candidates table
```

### Match Analysis Prompt Strategy

The Gemini prompt receives:
- Candidate name, skills list, experience text
- Job title, required skills, experience requirement, description

It returns a JSON object with:
- `match_score` (0–100)
- `missing_skills` array
- `strengths` / `weaknesses` arrays
- `is_suitable` boolean
- `reasoning` text

### Interview Questions Generation

Based on candidate skills + job description, Gemini generates three categories:
- **Technical Questions** — specific to the tech stack (5 questions)
- **Scenario-Based Questions** — real-world problem solving (3 questions)
- **Behavioral Questions** — soft skills and culture fit (3 questions)

Each question includes a `purpose` field explaining what the interviewer is assessing.

### Candidate Summary

Provides:
- Professional overview paragraph
- Skill assessment
- Experience summary
- Hiring recommendation: `STRONG_HIRE | HIRE | MAYBE | PASS | INSUFFICIENT_DATA`

---

## Role-Based Access

| Feature                       | HR  | Recruiter |
|-------------------------------|-----|-----------|
| Upload resumes                | ✅  | ❌        |
| View candidates               | ✅  | ✅        |
| Delete candidates             | ✅  | ❌        |
| Create/Edit/Delete jobs       | ✅  | ❌        |
| View jobs                     | ✅  | ✅        |
| Run AI match / questions      | ✅  | ✅        |
| Generate candidate summary    | ✅  | ✅        |
| View evaluations              | ✅  | ✅        |
| View analytics dashboard      | ✅  | ❌        |

---

## Docker Setup

### Run with Docker Compose (easiest)

```bash
# 1. Copy and configure environment
cp backend/.env.example backend/.env
# Edit backend/.env — add your GEMINI_API_KEY

# 2. Start all services
docker-compose up --build

# 3. Access the app
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Individual Docker commands

```bash
# Backend only
docker build -t ai-resume-backend ./backend
docker run -p 8000:8000 --env-file ./backend/.env ai-resume-backend

# Frontend only
docker build -t ai-resume-frontend ./frontend
docker run -p 3000:80 ai-resume-frontend
```

---

## Deployment Instructions

### Option A — VPS / Cloud VM (Ubuntu)

```bash
# 1. Install dependencies
sudo apt update
sudo apt install -y python3.11 python3-pip nodejs npm mysql-server nginx

# 2. Clone and configure
git clone https://github.com/yourname/ai-resume-screener
cd ai-resume-screener
cp backend/.env.example backend/.env
# Edit .env with production values

# 3. Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# 4. Frontend
cd ../frontend
npm install
npm run build
sudo cp -r build/* /var/www/html/

# 5. Nginx config — point / to /var/www/html and /api to localhost:8000
```

### Option B — Docker Compose on any cloud

```bash
# On your server:
git clone https://github.com/yourname/ai-resume-screener
cd ai-resume-screener
cp backend/.env.example backend/.env
# Set GEMINI_API_KEY and a strong SECRET_KEY in backend/.env

docker-compose up -d --build
```

### Option C — Railway / Render (free tier)

1. Push code to GitHub
2. Create a new service on Railway/Render pointing to your repo
3. Set environment variables in the platform dashboard
4. Deploy — they handle the rest

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Access denied for user 'root'` | Check MySQL password in `.env` DATABASE_URL |
| `GEMINI_API_KEY invalid` | Regenerate key at https://aistudio.google.com |
| `Module not found` (Python) | Run `pip install -r requirements.txt` in venv |
| `npm start` fails | Run `npm install` first |
| CORS error in browser | Make sure backend is running on port 8000 |
| File upload fails | Check `UPLOAD_DIR=uploads` in `.env` |
| `Table doesn't exist` | The app auto-creates tables on startup — check DB URL |

---

## Quick Start Checklist

- [ ] MySQL running and `ai_resume_db` created
- [ ] `backend/.env` filled in (DB URL + Gemini API key + SECRET_KEY)
- [ ] Python venv activated and `pip install -r requirements.txt` done
- [ ] `python run.py` → backend running at http://localhost:8000
- [ ] `npm install && npm start` → frontend at http://localhost:3000
- [ ] Register as **HR** role to access all features
- [ ] Create a job description
- [ ] Upload a PDF or DOCX resume
- [ ] Go to AI Tools → select candidate + job → click Match!
