import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import CandidateDetail from './pages/CandidateDetail';
import Jobs from './pages/Jobs';
import AITools from './pages/AITools';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontSize: 13, fontFamily: 'Inter, sans-serif' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected — any role */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/candidates" element={
            <ProtectedRoute><Candidates /></ProtectedRoute>
          } />
          <Route path="/candidates/:id" element={
            <ProtectedRoute><CandidateDetail /></ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute><Jobs /></ProtectedRoute>
          } />
          <Route path="/ai" element={
            <ProtectedRoute><AITools /></ProtectedRoute>
          } />

          {/* HR only */}
          <Route path="/analytics" element={
            <ProtectedRoute hrOnly><Analytics /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
