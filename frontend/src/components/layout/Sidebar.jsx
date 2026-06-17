import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, Brain,
  BarChart3, LogOut, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isHR } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard', roles: ['hr', 'recruiter'] },
    { path: '/candidates', icon: <Users />, label: 'Candidates', roles: ['hr', 'recruiter'] },
    { path: '/jobs', icon: <Briefcase />, label: 'Job Descriptions', roles: ['hr', 'recruiter'] },
    { path: '/ai', icon: <Brain />, label: 'AI Tools', roles: ['hr', 'recruiter'] },
    { path: '/analytics', icon: <BarChart3 />, label: 'Analytics', roles: ['hr'] },
  ];

  const visible = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>🤖 AI Resume</h1>
        <span>Screening Platform</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Navigation</div>
        {visible.map(item => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name truncate">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
