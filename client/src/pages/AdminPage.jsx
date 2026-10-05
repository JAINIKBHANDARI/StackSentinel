import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  Shield,
  Users,
  Server,
  Activity,
  GitBranch,
  RefreshCw,
  CheckCircle2,
  Lock,
  Zap,
  Layers
} from 'lucide-react';
import MetricCard from '../components/dashboard/MetricCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import Button from '../components/common/Button';

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdminData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [statsRes, usersRes, activityRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/activity?limit=12')
      ]);

      setStats(statsRes.data?.data || null);
      setUsers(usersRes.data?.data || []);
      setActivities(activityRes.data?.data || []);
    } catch (err) {
      setError(err.userFriendlyMessage || 'Failed to load administrative console');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await api.put(`/admin/users/${targetUser.id}/role`, { role: newRole });
      if (res.data?.success) {
        addToast(`Updated ${targetUser.name}'s role to ${newRole}`, 'success');
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      addToast(err.userFriendlyMessage || 'Could not update role', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading administrative metrics and governance..." />;
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <ErrorState message={error} onRetry={() => fetchAdminData()} />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>
            <Shield size={24} color="var(--brand-primary-light)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              System Governance & Admin Hub
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
              Cross-cluster metrics, user access management, and system-wide audit telemetry
            </p>
          </div>
        </div>

        <Button variant="secondary" icon={RefreshCw} loading={refreshing} onClick={() => fetchAdminData(true)}>
          Refresh Metrics
        </Button>
      </div>

      {/* Global System Metrics */}
      <div className="metric-grid">
        <MetricCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          subtext="Registered platform accounts"
          icon={Users}
          iconBg="rgba(59, 130, 246, 0.15)"
          iconColor="#3b82f6"
        />

        <MetricCard
          title="Total Services"
          value={stats?.totalServices || 0}
          subtext="Active monitored microservices"
          icon={Server}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10b981"
        />

        <MetricCard
          title="Health Probes Run"
          value={stats?.totalHealthChecks || 0}
          subtext="Persistent check records in DB"
          icon={Activity}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#f59e0b"
        />

        <MetricCard
          title="Deployments Logged"
          value={stats?.totalDeployments || 0}
          subtext="Tracked pipeline releases"
          icon={GitBranch}
          iconBg="rgba(139, 92, 246, 0.15)"
          iconColor="#8b5cf6"
        />

        <MetricCard
          title="Global Platform SLA"
          value={`${stats?.globalAvailability ?? 100}%`}
          subtext={`Avg Latency: ${stats?.globalAvgResponseTime || 0}ms`}
          icon={Zap}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10b981"
        />
      </div>

      {/* Users Governance & Cross-Service Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '1.75rem', alignItems: 'start' }}>
        {/* User Governance Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                User Governance & Access Control
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Manage roles (USER / ADMIN) and observe registered workloads
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--brand-primary-light)', fontWeight: 600 }}>
              {users.length} Users
            </span>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Services</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {u.name} {isCurrent && <span style={{ color: 'var(--brand-primary-light)', fontSize: '0.75rem' }}>(You)</span>}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {u.email}
                      </td>
                      <td>
                        <span
                          style={{
                            background: u.role === 'ADMIN' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${u.role === 'ADMIN' ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-subtle)'}`,
                            color: u.role === 'ADMIN' ? 'var(--brand-primary-light)' : 'var(--text-secondary)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>{u.servicesCount || 0}</td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isCurrent}
                          onClick={() => handleToggleRole(u)}
                          title={isCurrent ? "Cannot change own role" : `Switch to ${u.role === 'ADMIN' ? 'USER' : 'ADMIN'}`}
                        >
                          {u.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity Stream */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              System Audit Telemetry
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Audit Feed
            </span>
          </div>

          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
