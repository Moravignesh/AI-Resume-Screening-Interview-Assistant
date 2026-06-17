import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, MapPin, Clock, Briefcase } from 'lucide-react';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EMPTY_FORM = { title: '', required_skills: '', experience_requirement: '', location: '', employment_type: 'Full-time', description: '' };

export default function Jobs() {
  const { isHR } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.getAll();
      setJobs(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (job) => {
    setEditing(job);
    setForm({
      title: job.title,
      required_skills: (job.required_skills || []).join(', '),
      experience_requirement: job.experience_requirement || '',
      location: job.location || '',
      employment_type: job.employment_type || 'Full-time',
      description: job.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      required_skills: form.required_skills.split(',').map(s => s.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await jobsAPI.update(editing.id, data);
        toast.success('Job updated');
      } else {
        await jobsAPI.create(data);
        toast.success('Job created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job description?')) return;
    try {
      await jobsAPI.delete(id);
      toast.success('Job deleted');
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Job Descriptions</h2>
          <p>Manage open positions for candidate matching</p>
        </div>
        {isHR && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> New Job
          </button>
        )}
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading-center"><span className="spinner spinner-dark" /></div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <Briefcase />
            <h3>No job descriptions yet</h3>
            <p>Create job postings to match against candidate resumes</p>
            {isHR && <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={openCreate}><Plus size={16} /> Create Job</button>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {jobs.map(job => (
              <div key={job.id} className="card">
                <div className="card-header">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{job.title}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }} className="text-muted text-sm"><MapPin size={12} />{job.location}</span>}
                      {job.employment_type && <span className="badge badge-blue">{job.employment_type}</span>}
                      {job.experience_requirement && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }} className="text-muted text-sm"><Clock size={12} />{job.experience_requirement}</span>}
                    </div>
                  </div>
                  {isHR && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(job)}><Pencil size={14} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(job.id)}><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  {job.description && <p className="text-sm" style={{ marginBottom: 12, color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.description}</p>}
                  <div>
                    <div className="text-muted" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Required Skills</div>
                    <div>{(job.required_skills || []).map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Job' : 'New Job Description'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Python Developer" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Remote / Mumbai" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employment Type</label>
                    <select className="form-select" value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })}>
                      <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Required</label>
                  <input className="form-input" value={form.experience_requirement} onChange={e => setForm({ ...form, experience_requirement: e.target.value })} placeholder="e.g. 3+ years" />
                </div>
                <div className="form-group">
                  <label className="form-label">Required Skills *</label>
                  <input className="form-input" value={form.required_skills} onChange={e => setForm({ ...form, required_skills: e.target.value })} placeholder="Python, FastAPI, MySQL, Docker" required />
                  <p className="form-hint">Comma-separated list of skills</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Job Description *</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the role, responsibilities, and requirements…" required style={{ minHeight: 120 }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving…</> : editing ? 'Save Changes' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
