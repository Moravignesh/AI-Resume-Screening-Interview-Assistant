import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, CheckCircle, XCircle, Clock } from 'lucide-react';
import { candidatesAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';

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

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    async function load() {
      try {
        const [cRes, eRes] = await Promise.all([
          candidatesAPI.getById(id),
          aiAPI.evaluations(id),
        ]);
        setCandidate(cRes.data);
        setEvaluations(eRes.data);
      } catch {
        toast.error('Failed to load candidate');
        navigate('/candidates');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="loading-center" style={{ minHeight: '100vh' }}><span className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>;
  if (!candidate) return null;

  const matchEvals = evaluations.filter(e => e.eval_type === 'match');
  const summaryEval = evaluations.filter(e => e.eval_type === 'summary')[0];
  const questionEvals = evaluations.filter(e => e.eval_type === 'questions');

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/candidates')}><ArrowLeft size={18} /></button>
          <div>
            <h2>{candidate.name}</h2>
            <p>{candidate.email} {candidate.phone && `· ${candidate.phone}`}</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`/ai?candidate=${id}`)}>
          <Brain size={16} /> Run AI Analysis
        </button>
      </div>

      <div className="page-body">
        <div className="tabs">
          {['profile', 'evaluations'].map(t => (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'evaluations' && evaluations.length > 0 && (
                <span className="badge badge-purple" style={{ marginLeft: 6 }}>{evaluations.length}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header"><h3>Contact Information</h3></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div><span className="text-muted">Email: </span>{candidate.email || '—'}</div>
                    <div><span className="text-muted">Phone: </span>{candidate.phone || '—'}</div>
                    <div><span className="text-muted">File: </span>
                      <span className={`badge ${candidate.file_type === 'pdf' ? 'badge-red' : 'badge-blue'}`}>
                        {candidate.file_name}
                      </span>
                    </div>
                    <div><span className="text-muted">Uploaded: </span>{new Date(candidate.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3>Skills</h3><span className="badge badge-purple">{(candidate.skills || []).length}</span></div>
                <div className="card-body">
                  {(candidate.skills || []).length === 0 ? (
                    <p className="text-muted">No skills extracted</p>
                  ) : (
                    <div>{(candidate.skills || []).map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header"><h3>Work Experience</h3></div>
                <div className="card-body">
                  {(candidate.work_experience || []).length === 0 ? (
                    <p className="text-muted">No experience data extracted</p>
                  ) : (
                    (candidate.work_experience || []).map((exp, i) => (
                      <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < candidate.work_experience.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        {exp.role && <div style={{ fontWeight: 600 }}>{exp.role}</div>}
                        {exp.company && <div className="text-muted">{exp.company} {exp.duration && `· ${exp.duration}`}</div>}
                        {exp.description && <div className="text-sm" style={{ marginTop: 4 }}>{exp.description}</div>}
                        {exp.raw && !exp.role && <div className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{exp.raw.slice(0, 300)}</div>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3>Education</h3></div>
                <div className="card-body">
                  {(candidate.education || []).length === 0 ? (
                    <p className="text-muted">No education data extracted</p>
                  ) : (
                    (candidate.education || []).map((edu, i) => (
                      <div key={i} style={{ marginBottom: 8 }}>
                        {edu.degree && <div style={{ fontWeight: 600 }}>{edu.degree}</div>}
                        {edu.institution && <div className="text-muted">{edu.institution} {edu.year && `· ${edu.year}`}</div>}
                        {edu.raw && !edu.degree && <div className="text-sm">{edu.raw.slice(0, 200)}</div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div>
            {evaluations.length === 0 ? (
              <div className="empty-state">
                <Brain />
                <h3>No evaluations yet</h3>
                <p>Run AI analysis to see match scores, summaries and interview questions</p>
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate(`/ai?candidate=${id}`)}>
                  <Brain size={16} /> Run AI Analysis
                </button>
              </div>
            ) : (
              <>
                {summaryEval && (
                  <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-header">
                      <h3>AI Candidate Summary</h3>
                      <RecChip rec={summaryEval.recommendation} />
                    </div>
                    <div className="card-body">
                      {summaryEval.full_result && (
                        <div>
                          <div className="ai-section">
                            <h4>Overview</h4>
                            <p>{summaryEval.full_result.overview}</p>
                          </div>
                          {summaryEval.full_result.skill_assessment && (
                            <div className="ai-section">
                              <h4>Skill Assessment</h4>
                              <p>{summaryEval.full_result.skill_assessment}</p>
                            </div>
                          )}
                          {summaryEval.full_result.experience_summary && (
                            <div className="ai-section">
                              <h4>Experience Summary</h4>
                              <p>{summaryEval.full_result.experience_summary}</p>
                            </div>
                          )}
                          {summaryEval.full_result.recommendation && (
                            <div className="ai-section">
                              <h4>Recommendation</h4>
                              <p>{summaryEval.full_result.recommendation}</p>
                            </div>
                          )}
                          {(summaryEval.full_result.key_strengths || []).length > 0 && (
                            <div className="ai-section">
                              <h4>Key Strengths</h4>
                              {summaryEval.full_result.key_strengths.map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                                  <CheckCircle size={14} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
                                  <span className="text-sm">{s}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {matchEvals.map(ev => (
                  <div key={ev.id} className="card" style={{ marginBottom: 16 }}>
                    <div className="card-header">
                      <h3>Match Analysis</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={`score-ring ${ev.match_score >= 70 ? 'score-high' : ev.match_score >= 40 ? 'score-mid' : 'score-low'}`}>
                          {Math.round(ev.match_score)}
                        </div>
                        <span className="text-muted text-sm">{new Date(ev.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="card-body grid-2">
                      <div>
                        <div className="ai-section">
                          <h4>Strengths</h4>
                          {(ev.strengths || []).map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                              <CheckCircle size={14} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
                              <span className="text-sm">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="ai-section">
                          <h4>Missing Skills</h4>
                          {(ev.missing_skills || []).map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                              <XCircle size={14} color="var(--danger)" style={{ marginTop: 2, flexShrink: 0 }} />
                              <span className="text-sm">{s}</span>
                            </div>
                          ))}
                          {(ev.missing_skills || []).length === 0 && <p className="text-muted text-sm">No missing skills!</p>}
                        </div>
                      </div>
                    </div>
                    {ev.full_result?.reasoning && (
                      <div style={{ padding: '0 20px 16px' }}>
                        <div className="alert alert-info">{ev.full_result.reasoning}</div>
                      </div>
                    )}
                  </div>
                ))}

                {questionEvals.map(ev => (
                  <div key={ev.id} className="card" style={{ marginBottom: 16 }}>
                    <div className="card-header">
                      <h3>Interview Questions</h3>
                      <span className="text-muted text-sm">{new Date(ev.created_at).toLocaleString()}</span>
                    </div>
                    <div className="card-body">
                      {ev.interview_questions && ['technical_questions', 'scenario_based_questions', 'behavioral_questions'].map(type => {
                        const questions = ev.interview_questions[type] || [];
                        if (!questions.length) return null;
                        const labels = { technical_questions: '🔧 Technical', scenario_based_questions: '📋 Scenario-Based', behavioral_questions: '🧠 Behavioral' };
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
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
