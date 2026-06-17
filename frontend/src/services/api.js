import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
};

// ─── Candidates ───────────────────────────────────────────────────────────────
export const candidatesAPI = {
  upload: (formData) =>
    API.post('/candidates/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params) => API.get('/candidates', { params }),
  getById: (id) => API.get(`/candidates/${id}`),
  delete: (id) => API.delete(`/candidates/${id}`),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const jobsAPI = {
  create: (data) => API.post('/jobs', data),
  getAll: () => API.get('/jobs'),
  getById: (id) => API.get(`/jobs/${id}`),
  update: (id, data) => API.put(`/jobs/${id}`, data),
  delete: (id) => API.delete(`/jobs/${id}`),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiAPI = {
  match: (data) => API.post('/ai/match', data),
  questions: (data) => API.post('/ai/questions', data),
  summary: (data) => API.post('/ai/summary', data),
  evaluations: (candidateId) => API.get(`/ai/evaluations/${candidateId}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  get: () => API.get('/analytics'),
};
