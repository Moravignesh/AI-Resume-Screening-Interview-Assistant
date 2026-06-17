-- ============================================================
-- AI Resume Screener — MySQL Database Schema
-- Run this once to create the database and user
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS ai_resume_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ai_resume_db;

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(255)  NOT NULL,
    email            VARCHAR(255)  NOT NULL UNIQUE,
    hashed_password  VARCHAR(255)  NOT NULL,
    role             ENUM('hr','recruiter') NOT NULL DEFAULT 'recruiter',
    is_active        TINYINT(1)    NOT NULL DEFAULT 1,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Candidates ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidates (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(255)  NOT NULL,
    email            VARCHAR(255),
    phone            VARCHAR(50),
    skills           JSON,
    work_experience  JSON,
    education        JSON,
    raw_text         LONGTEXT,
    file_path        VARCHAR(500),
    file_name        VARCHAR(255),
    file_type        VARCHAR(50),
    uploaded_by      INT,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email  (email),
    INDEX idx_uploaded_by (uploaded_by),
    CONSTRAINT fk_candidate_user
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Job Descriptions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_descriptions (
    id                     INT AUTO_INCREMENT PRIMARY KEY,
    title                  VARCHAR(255) NOT NULL,
    required_skills        JSON,
    experience_requirement VARCHAR(100),
    location               VARCHAR(255),
    employment_type        VARCHAR(100),
    description            LONGTEXT,
    created_by             INT,
    created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             DATETIME ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_created_by   (created_by),
    CONSTRAINT fk_job_user
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Evaluations ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evaluations (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id        INT          NOT NULL,
    job_id              INT,
    eval_type           VARCHAR(50),   -- 'match' | 'questions' | 'summary'
    match_score         FLOAT,
    missing_skills      JSON,
    strengths           JSON,
    weaknesses          JSON,
    interview_questions JSON,
    summary             TEXT,
    recommendation      VARCHAR(100),
    full_result         JSON,
    created_by          INT,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_candidate (candidate_id),
    INDEX idx_job       (job_id),
    INDEX idx_created_by(created_by),
    CONSTRAINT fk_eval_candidate
        FOREIGN KEY (candidate_id) REFERENCES candidates(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_eval_job
        FOREIGN KEY (job_id) REFERENCES job_descriptions(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_eval_user
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Optional: seed a default HR admin user ──────────────────
-- Password below is bcrypt of "admin123" — change immediately!
-- INSERT INTO users (name, email, hashed_password, role)
-- VALUES ('Admin HR', 'admin@company.com',
--   '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
--   'hr');

SELECT 'Schema created successfully.' AS status;
