import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  LayoutDashboard,
  Server,
  GitBranch,
  Shield,
  User,
  Settings,
  Activity,
  PlusCircle
} from 'lucide-react';

const Sidebar = () => {
  const { isAdmin } = useAuth();
  const [platformStatus, setPlatformStatus] = useState('UP');

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res.data?.success) {
          setPlatformStatus(res.data.data.status);
        }
      } catch (err) {
        setPlatformStatus('DEGRADED');
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/services', label: 'Services', icon: Server },
    { to: '/deployments', label: 'Deployments', icon: GitBranch },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Hub', icon: Shield }] : []),
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <Activity size={20} color="var(--brand-primary-light)" />
        <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Telemetry Ops
        </span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            ENGINE STATUS
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: platformStatus === 'UP' ? 'var(--status-up)' : 'var(--status-degraded)'
            }}
          >
            <span
              className={`indicator-dot ${platformStatus}`}
              style={{ width: '6px', height: '6px' }}
            />
            {platformStatus}
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          StackSentinel v1.0.0 (ASE)
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
