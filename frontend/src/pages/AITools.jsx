import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, Zap, FileText, MessageSquare, CheckCircle, XCircle, Loader } from 'lucide-react';
import { candidatesAPI, jobsAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const ScoreRing = ({ score }) => {
  const cls = score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low';
  return <div className={`score-ring ${cls}`} style={{ width: 80, height: 80, fontSize: 22 }}>{Math.round(score)}</div>;
};

const RecChip = ({ rec }) => {
  const map = {
    STRONG_HIRE: ['rec-strong-hire', '🌟 Strong Hire'],
    HIRE: ['rec-hire', '✅ Hire'],
    MAYBE: ['rec-maybe', '🤔 Maybe'],
    PASS: ['rec-pass', '❌ Pass'],
    INSUFFICIENT_DATA: ['rec-maybe', '⚠️ Insufficient Data'],
  };
  const [cls, label] = map[rec] || ['rec-maybe', rec || 'Unknown'];
  return <span className={`rec-chip ${cls}`}>{label}</span>;
};

export default function AITools() {
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(searchParams.get('candidate') || '');
  const [selectedJob, setSelectedJob] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeAction, setActiveAction] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [cRes, jRes] = await Promise.all([candidatesAPI.getAll(), jobsAPI.getAll()]);
        setCandidates(cRes.data);
        setJobs(jRes.data);
      } catch { toast.error('Failed to load data'); }
    }
    load();
  }, []);

  const run = async (action) => {
    if (!selectedCandidate) return toast.error('Select a candidate first');
    if ((action === 'match' || action === 'questions') && !selectedJob) return toast.error('Select a job description');

    setLoading(true);
    setActiveAction(action);
    setResult(null);

    try {
      let res;
      if (action === 'match') res = await aiAPI.match({ candidate_id: +selectedCandidate, job_id: +selectedJob });
      else if (action === 'questions') res = await aiAPI.questions({ candidate_id: +selectedCandidate, job_id: +selectedJob });
      else if (action === 'summary') res = await aiAPI.summary({ candidate_id: +selectedCandidate });

      setResult({ type: action, data: res.data });
      toast.success('AI analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'AI analysis failed. Check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>AI Tools</h2>
          <p>Powered by Google Gemini — match candidates, generate questions, and create summaries</p>
        </div>
      </div>

      <div className="page-body">
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Left: Controls */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><h3>Configuration</h3></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Select Candidate *</label>
                  <select className="form-select" value={selectedCandidate} onChange={e => { setSelectedCandidate(e.target.value); setResult(null); }}>
                    <option value="">— Choose a candidate —</option>
                    {candidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email || 'no email'})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Select Job (for Match & Questions)</label>
                  <select className="form-select" value={selectedJob} onChange={e => { setSelectedJob(e.target.value); setResult(null); }}>
                    <option value="">— Choose a job —</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3>AI Actions</h3></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  className="btn btn-primary w-full"
                  style={{ justifyContent: 'center', padding: '12px' }}
                  onClick={() => run('match')}
                  disabled={loading}
                >
                  {loading && activeAction === 'match' ? <><span className="spinner" /> Analyzing…</> : <><Zap size={16} /> Match Resume to Job</>}
                </button>
                <button
                  className="btn btn-success w-full"
                  style={{ justifyContent: 'center', padding: '12px' }}
                  onClick={() => run('questions')}
                  disabled={loading}
                >
                  {loading && activeAction === 'questions' ? <><span className="spinner" /> Generating…</> : <><MessageSquare size={16} /> Generate Interview Questions</>}
                </button>
                <button
                  className="btn btn-secondary w-full"
                  style={{ justifyContent: 'center', padding: '12px' }}
                  onClick={() => run('summary')}
                  disabled={loading}
                >
                  {loading && activeAction === 'summary' ? <><span className="spinner spinner-dark" /> Summarizing…</> : <><FileText size={16} /> Generate Candidate Summary</>}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div>
            {loading && (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Loader size={40} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                  <p style={{ fontWeight: 600 }}>Gemini AI is analyzing…</p>
                  <p className="text-muted">This may take a few seconds</p>
                </div>
              </div>
            )}

            {!loading && !result && (
              <div className="card">
                <div className="empty-state">
                  <Brain />
                  <h3>Ready for Analysis</h3>
                  <p>Select a candidate and job, then choose an AI action</p>
                </div>
              </div>
            )}

            {!loading && result?.type === 'match' && (
              <div className="card">
                <div className="card-header">
                  <h3>Match Analysis Result</h3>
                  <ScoreRing score={result.data.match_score || 0} />
                </div>
                <div className="card-body">
                  <div className="ai-section">
                    <h4>Strengths</h4>
                    {(result.data.strengths || []).map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                        <CheckCircle size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span className="text-sm">{s}</span>
                      </div>
                    ))}
                  </div>
                  <hr className="divider" />
                  <div className="ai-section">
                    <h4>Missing Skills</h4>
                    {(result.data.missing_skills || []).length === 0
                      ? <p className="text-muted text-sm">No missing skills identified!</p>
                      : (result.data.missing_skills || []).map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                          <XCircle size={15} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
                          <span className="text-sm">{s}</span>
                        </div>
                      ))}
                  </div>
                  {result.data.full_result?.reasoning && (
                    <>
                      <hr className="divider" />
                      <div className="alert alert-info">{result.data.full_result.reasoning}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {!loading && result?.type === 'questions' && (
              <div className="card">
                <div className="card-header"><h3>Interview Questions</h3></div>
                <div className="card-body">
                  {result.data.interview_questions && ['technical_questions', 'scenario_based_questions', 'behavioral_questions'].map(type => {
                    const questions = result.data.interview_questions[type] || [];
                    if (!questions.length) return null;
                    const labels = {
                      technical_questions: '🔧 Technical Questions',
                      scenario_based_questions: '📋 Scenario-Based Questions',
                      behavioral_questions: '🧠 Behavioral Questions'
                    };
                    return (
                      <div key={type} className="ai-section">
                        <h4>{labels[type]}</h4>
                        {questions.map((q, i) => (
                          <div key={i} className="question-item">
                            <p>Q{i + 1}: {q.question}</p>
                            {q.purpose && <span>Purpose: {q.purpose}</span>}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!loading && result?.type === 'summary' && (
              <div className="card">
                <div className="card-header">
                  <h3>Candidate Summary</h3>
                  {result.data.full_result?.hiring_recommendation && (
                    <RecChip rec={result.data.full_result.hiring_recommendation} />
                  )}
                </div>
                <div className="card-body">
                  {result.data.full_result && (
                    <>
                      {result.data.full_result.overview && (
                        <div className="ai-section">
                          <h4>Overview</h4>
                          <p>{result.data.full_result.overview}</p>
                        </div>
                      )}
                      {result.data.full_result.skill_assessment && (
                        <div className="ai-section">
                          <h4>Skill Assessment</h4>
                          <p>{result.data.full_result.skill_assessment}</p>
                        </div>
                      )}
                      {result.data.full_result.experience_summary && (
                        <div className="ai-section">
                          <h4>Experience Summary</h4>
                          <p>{result.data.full_result.experience_summary}</p>
                        </div>
                      )}
                      {result.data.full_result.recommendation && (
                        <div className="ai-section">
                          <h4>Hiring Recommendation</h4>
                          <p>{result.data.full_result.recommendation}</p>
                        </div>
                      )}
                      {(result.data.full_result.key_strengths || []).length > 0 && (
                        <div className="ai-section">
                          <h4>Key Strengths</h4>
                          {result.data.full_result.key_strengths.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                              <CheckCircle size={14} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
                              <span className="text-sm">{s}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
