import json
import re
import httpx
from typing import Dict, Any, List
from app.config import settings

# Groq API endpoint
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# Free & fast models on Groq
MODEL_NAME = "llama-3.3-70b-versatile"
# Other great free Groq models:
# "llama-3.1-8b-instant"       — fastest
# "mixtral-8x7b-32768"         — good for long context
# "gemma2-9b-it"               — Google Gemma 2


def _call_groq(prompt: str) -> str:
    """Send a prompt to Groq and return the response text."""
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {
                "role": "system",
                "content": "You are an expert HR analyst. Always respond with valid JSON only. No markdown, no explanation, no extra text — just the raw JSON object.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 1500,
    }
    response = httpx.post(GROQ_URL, json=payload, headers=headers, timeout=60)
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]


def _safe_json_parse(text: str) -> Any:
    """Strip markdown fences and parse JSON safely."""
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    text = text.strip()
    # Extract JSON block if model adds surrounding text
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        text = match.group(0)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def ai_match_resume(
    candidate_name: str,
    candidate_skills: List[str],
    candidate_experience: str,
    job_title: str,
    job_required_skills: List[str],
    job_description: str,
    job_experience_req: str,
) -> Dict[str, Any]:
    """Match a candidate against a job description using Groq AI."""

    prompt = f"""Analyze this candidate against the job. Return ONLY this JSON:

CANDIDATE:
Name: {candidate_name}
Skills: {', '.join(candidate_skills)}
Experience: {candidate_experience[:600]}

JOB:
Title: {job_title}
Required Skills: {', '.join(job_required_skills)}
Experience Required: {job_experience_req}
Description: {job_description[:800]}

Return ONLY this JSON:
{{
  "match_score": <number 0-100>,
  "missing_skills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "is_suitable": <true or false>,
  "reasoning": "2-3 sentence explanation"
}}"""

    try:
        raw = _call_groq(prompt)
        result = _safe_json_parse(raw)
        if not result:
            return {
                "match_score": 0,
                "missing_skills": [],
                "strengths": [],
                "weaknesses": ["Could not parse AI response"],
                "is_suitable": False,
                "reasoning": raw[:300],
            }
        return result
    except Exception as e:
        print(f"Groq match error: {e}")
        return {
            "match_score": 0,
            "missing_skills": [],
            "strengths": [],
            "weaknesses": [str(e)],
            "is_suitable": False,
            "reasoning": "AI service error. Check your Groq API key.",
        }


def ai_generate_questions(
    candidate_name: str,
    candidate_skills: List[str],
    candidate_experience: str,
    job_title: str,
    job_description: str,
) -> Dict[str, Any]:
    """Generate interview questions using Groq AI."""

    prompt = f"""Generate interview questions for this candidate and role.

CANDIDATE: {candidate_name}
Skills: {', '.join(candidate_skills)}
Experience: {candidate_experience[:400]}

JOB: {job_title}
Description: {job_description[:600]}

Return ONLY this JSON:
{{
  "technical_questions": [
    {{"question": "...", "purpose": "..."}},
    {{"question": "...", "purpose": "..."}},
    {{"question": "...", "purpose": "..."}},
    {{"question": "...", "purpose": "..."}},
    {{"question": "...", "purpose": "..."}}
  ],
  "scenario_based_questions": [
    {{"question": "...", "purpose": "..."}},
    {{"question": "...", "purpose": "..."}},
    {{"question": "...", "purpose": "..."}}
  ],
  "behavioral_questions": [
    {{"question": "...", "purpose": "..."}},
    {{"question": "...", "purpose": "..."}},
    {{"question": "...", "purpose": "..."}}
  ]
}}"""

    try:
        raw = _call_groq(prompt)
        result = _safe_json_parse(raw)
        if not result:
            return {
                "technical_questions": [{"question": "Could not generate. Check Groq API key.", "purpose": "N/A"}],
                "scenario_based_questions": [],
                "behavioral_questions": [],
            }
        return result
    except Exception as e:
        print(f"Groq questions error: {e}")
        return {
            "technical_questions": [{"question": f"AI error: {str(e)}", "purpose": "N/A"}],
            "scenario_based_questions": [],
            "behavioral_questions": [],
        }


def ai_generate_summary(
    candidate_name: str,
    candidate_skills: List[str],
    candidate_experience: str,
    candidate_education: str,
    candidate_email: str,
) -> Dict[str, Any]:
    """Generate a comprehensive candidate summary using Groq AI."""

    if not candidate_skills and not candidate_experience:
        return {
            "overview": "Insufficient information available to generate a summary.",
            "skill_assessment": "No skills data found.",
            "experience_summary": "No experience data found.",
            "recommendation": "Cannot make a recommendation without sufficient data.",
            "hiring_recommendation": "INSUFFICIENT_DATA",
            "key_strengths": [],
            "areas_for_improvement": [],
        }

    prompt = f"""Create a professional candidate summary.

CANDIDATE:
Name: {candidate_name}
Email: {candidate_email}
Skills: {', '.join(candidate_skills)}
Experience: {candidate_experience[:600]}
Education: {candidate_education[:300]}

Return ONLY this JSON:
{{
  "overview": "3-4 sentence professional overview",
  "skill_assessment": "Assessment of skills and technical proficiency",
  "experience_summary": "Summary of work experience and career progression",
  "recommendation": "Detailed hiring recommendation with justification",
  "hiring_recommendation": "STRONG_HIRE",
  "key_strengths": ["strength1", "strength2", "strength3"],
  "areas_for_improvement": ["area1", "area2"]
}}

hiring_recommendation must be exactly one of: STRONG_HIRE, HIRE, MAYBE, PASS"""

    try:
        raw = _call_groq(prompt)
        result = _safe_json_parse(raw)
        if not result:
            return {
                "overview": f"{candidate_name} is a candidate whose resume has been processed.",
                "skill_assessment": f"Skills identified: {', '.join(candidate_skills)}",
                "experience_summary": candidate_experience[:300],
                "recommendation": "Manual review recommended.",
                "hiring_recommendation": "MAYBE",
                "key_strengths": candidate_skills[:3],
                "areas_for_improvement": [],
            }
        return result
    except Exception as e:
        print(f"Groq summary error: {e}")
        return {
            "overview": f"{candidate_name} is a candidate whose resume has been processed.",
            "skill_assessment": f"Skills: {', '.join(candidate_skills)}",
            "experience_summary": "See resume for details.",
            "recommendation": f"AI error: {str(e)}",
            "hiring_recommendation": "MAYBE",
            "key_strengths": [],
            "areas_for_improvement": [],
        }


def ai_extract_resume_info(raw_text: str) -> Dict[str, Any]:
    """Use Groq AI to extract structured info from raw resume text."""

    if not raw_text or len(raw_text) < 50:
        return {}

    prompt = f"""Extract structured information from this resume.

RESUME TEXT:
{raw_text[:3000]}

Return ONLY this JSON:
{{
  "name": "Full name of candidate",
  "email": "email or empty string",
  "phone": "phone number or empty string",
  "skills": ["skill1", "skill2", "skill3"],
  "work_experience": [
    {{"company": "...", "role": "...", "duration": "...", "description": "..."}}
  ],
  "education": [
    {{"institution": "...", "degree": "...", "year": "..."}}
  ]
}}"""

    try:
        raw = _call_groq(prompt)
        result = _safe_json_parse(raw)
        return result or {}
    except Exception as e:
        print(f"Groq extraction error: {e}")
        return {}