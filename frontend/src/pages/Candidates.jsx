import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Search, Trash2, Eye, FileText, Users } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { candidatesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Candidates() {
  const navigate = useNavigate();
  const { isHR } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const load = async (q = '') => {
    setLoading(true);
    try {
      const res = await candidatesAPI.getAll({ search: q || undefined });
      setCandidates(res.data);
    } catch {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const onDrop = useCallback(async (files) => {
    if (!files.length) return;
    setUploading(true);
    let successCount = 0;
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        await candidatesAPI.upload(fd);
        successCount++;
      } catch (err) {
        toast.error(`Failed: ${file.name} — ${err.response?.data?.detail || 'Upload error'}`);
      }
    }
    if (successCount > 0) {
      toast.success(`${successCount} resume(s) uploaded & processed!`);
      setShowUpload(false);
      load();
    }
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    multiple: true,
  });

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this candidate?')) return;
    try {
      await candidatesAPI.delete(id);
      toast.success('Candidate deleted');
      setCandidates(prev => prev.filter(c => c.id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Candidates</h2>
          <p>Manage and review candidate profiles</p>
        </div>
        {isHR && (
          <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
            <Upload size={16} /> Upload Resume
          </button>
        )}
      </div>

      <div className="page-body">
        {showUpload && isHR && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><h3>Upload Resumes</h3><span className="text-muted">PDF or DOCX accepted</span></div>
            <div className="card-body">
              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                <div className="dropzone-icon"><FileText size={44} color="var(--primary)" /></div>
                {uploading ? (
                  <p><span className="spinner spinner-dark" style={{ display: 'inline-block', marginRight: 8 }} />Processing resumes with AI…</p>
                ) : (
                  <>
                    <p><strong>Drop resumes here</strong> or click to browse</p>
                    <p style={{ marginTop: 4 }}>Supports PDF and DOCX • Multiple files allowed</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <form className="search-bar" onSubmit={handleSearch}>
          <input className="form-input" placeholder="Search by name or email…" value={search}
            onChange={e => setSearch(e.target.value)} />
          <button type="submit" className="btn btn-secondary"><Search size={16} /> Search</button>
          {search && <button type="button" className="btn btn-ghost" onClick={() => { setSearch(''); load(); }}>Clear</button>}
        </form>

        <div className="card">
          <div className="card-header">
            <h3>All Candidates <span className="badge badge-gray" style={{ marginLeft: 8 }}>{candidates.length}</span></h3>
          </div>
          {loading ? (
            <div className="loading-center"><span className="spinner spinner-dark" /></div>
          ) : candidates.length === 0 ? (
            <div className="empty-state">
              <Users />
              <h3>No candidates found</h3>
              <p>{search ? 'Try a different search term' : 'Upload resumes to get started'}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Skills</th>
                    <th>File</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, i) => (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/candidates/${c.id}`)}>
                      <td className="text-muted">{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td className="text-muted">{c.email || '—'}</td>
                      <td className="text-muted">{c.phone || '—'}</td>
                      <td>
                        {(c.skills || []).slice(0, 3).map(s => <span key={s} className="skill-tag">{s}</span>)}
                        {(c.skills || []).length > 3 && <span className="text-muted"> +{c.skills.length - 3}</span>}
                      </td>
                      <td>
                        <span className={`badge ${c.file_type === 'pdf' ? 'badge-red' : 'badge-blue'}`}>
                          {c.file_type?.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate(`/candidates/${c.id}`)} title="View">
                            <Eye size={15} />
                          </button>
                          {isHR && (
                            <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }}
                              onClick={e => handleDelete(c.id, e)} title="Delete">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
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
