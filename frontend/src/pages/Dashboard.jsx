import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Brain, TrendingUp, Upload, FileSearch } from 'lucide-react';
import { candidatesAPI, jobsAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, isHR } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ candidates: 0, jobs: 0, evaluations: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [candRes, jobRes] = await Promise.all([
          candidatesAPI.getAll({ limit: 5 }),
          jobsAPI.getAll(),
        ]);
        setStats({
          candidates: candRes.data.length,
          jobs: jobRes.data.length,
          evaluations: 0,
        });
        setRecent(candRes.data.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const quickActions = [
    { label: 'Upload Resume', icon: <Upload size={20} />, action: () => navigate('/candidates'), color: 'blue', visible: isHR },
    { label: 'Browse Candidates', icon: <Users size={20} />, action: () => navigate('/candidates'), color: 'purple', visible: true },
    { label: 'Manage Jobs', icon: <Briefcase size={20} />, action: () => navigate('/jobs'), color: 'green', visible: isHR },
    { label: 'AI Tools', icon: <Brain size={20} />, action: () => navigate('/ai'), color: 'orange', visible: true },
  ].filter(a => a.visible);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Here's what's happening on your platform today</p>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue"><Users size={22} /></div>
            <div>
              <div className="stat-value">{loading ? '—' : stats.candidates}</div>
              <div className="stat-label">Total Candidates</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><Briefcase size={22} /></div>
            <div>
              <div className="stat-value">{loading ? '—' : stats.jobs}</div>
              <div className="stat-label">Job Descriptions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><Brain size={22} /></div>
            <div>
              <div className="stat-value">AI</div>
              <div className="stat-label">Powered Screening</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><TrendingUp size={22} /></div>
            <div>
              <div className="stat-value">Live</div>
              <div className="stat-label">Gemini AI Integration</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mb-16" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3>Quick Actions</h3></div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {quickActions.map((a, i) => (
              <button key={i} className="btn btn-secondary" style={{ padding: '14px', flexDirection: 'column', gap: 8, height: 80 }} onClick={a.action}>
                {a.icon}
                <span style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Candidates */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Candidates</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/candidates')}>View all →</button>
          </div>
          {loading ? (
            <div className="loading-center"><span className="spinner spinner-dark" /></div>
          ) : recent.length === 0 ? (
            <div className="empty-state">
              <FileSearch />
              <h3>No candidates yet</h3>
              <p>Upload your first resume to get started</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Skills</th>
                    <th>Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(c => (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/candidates/${c.id}`)}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td className="text-muted">{c.email || '—'}</td>
                      <td>
                        {(c.skills || []).slice(0, 3).map(s => (
                          <span key={s} className="skill-tag">{s}</span>
                        ))}
                        {(c.skills || []).length > 3 && <span className="text-muted"> +{c.skills.length - 3}</span>}
                      </td>
                      <td className="text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
