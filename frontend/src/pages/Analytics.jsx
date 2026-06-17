import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Briefcase, TrendingUp, Star, BarChart3 } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await analyticsAPI.get();
        setData(res.data);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="loading-center" style={{ minHeight: '60vh' }}>
      <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (!data) return (
    <div className="page-body">
      <div className="alert alert-error">Failed to load analytics. Ensure you have HR role access.</div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Analytics Dashboard</h2>
          <p>Platform-wide insights and hiring metrics</p>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue"><Users size={22} /></div>
            <div>
              <div className="stat-value">{data.total_candidates}</div>
              <div className="stat-label">Total Candidates</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><Briefcase size={22} /></div>
            <div>
              <div className="stat-value">{data.total_jobs}</div>
              <div className="stat-label">Job Descriptions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><TrendingUp size={22} /></div>
            <div>
              <div className="stat-value">{data.average_match_score != null ? `${data.average_match_score}%` : '—'}</div>
              <div className="stat-label">Avg Match Score</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><Star size={22} /></div>
            <div>
              <div className="stat-value">{data.most_requested_skills?.[0]?.skill || '—'}</div>
              <div className="stat-label">Top Requested Skill</div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Skills Chart */}
          <div className="card">
            <div className="card-header"><h3>Most Requested Skills</h3><BarChart3 size={18} color="var(--text-muted)" /></div>
            <div className="card-body">
              {data.most_requested_skills?.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.most_requested_skills} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="skill" tick={{ fontSize: 12 }} width={90} />
                    <Tooltip formatter={(v) => [`${v} jobs`, 'Count']} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {data.most_requested_skills.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted">No skill data yet</p>
              )}
            </div>
          </div>

          {/* Active Users */}
          <div className="card">
            <div className="card-header"><h3>Most Active Users</h3></div>
            <div className="card-body">
              {data.most_active_users?.length > 0 ? (
                <div>
                  {data.most_active_users.map((u, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < data.most_active_users.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{u.name?.[0]?.toUpperCase()}</div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</span>
                      </div>
                      <span className="badge badge-purple">{u.eval_count} analyses</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No activity data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Candidates */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header"><h3>Recent Candidate Uploads</h3></div>
          {data.recent_candidates?.length === 0 ? (
            <div className="empty-state"><p>No candidates uploaded yet</p></div>
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
                  {(data.recent_candidates || []).map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td className="text-muted">{c.email || '—'}</td>
                      <td>
                        {(c.skills || []).slice(0, 4).map(s => <span key={s} className="skill-tag">{s}</span>)}
                        {(c.skills || []).length > 4 && <span className="text-muted"> +{c.skills.length - 4}</span>}
                      </td>
                      <td className="text-muted">{new Date(c.created_at).toLocaleString()}</td>
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
