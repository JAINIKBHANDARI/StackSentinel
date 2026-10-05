import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  ArrowLeft,
  RefreshCw,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  Calendar,
  Layers,
  ShieldCheck,
  Server
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import MetricCard from '../components/dashboard/MetricCard';
import AvailabilityBar from '../components/dashboard/AvailabilityBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import Button from '../components/common/Button';

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [service, setService] = useState(null);
  const [stats, setStats] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchServiceDetails = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [serviceRes, historyRes] = await Promise.all([
        api.get(`/services/${id}`),
        api.get(`/services/${id}/health-history?limit=50`)
      ]);

      if (serviceRes.data?.success) {
        setService(serviceRes.data.data.service);
        setStats(serviceRes.data.data.stats);
      }
      if (historyRes.data?.success) {
        setHealthHistory(historyRes.data.data);
      }
    } catch (err) {
      setError(err.userFriendlyMessage || 'Could not fetch service details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchServiceDetails();
  }, [fetchServiceDetails]);

  const handleManualCheck = async () => {
    setRefreshing(true);
    try {
      const res = await api.post(`/services/${id}/check`);
      if (res.data?.success) {
        addToast(`Health probe triggered: ${res.data.data.service.status}`, 'success');
        await fetchServiceDetails(true);
      }
    } catch (err) {
      addToast(err.userFriendlyMessage || 'Health check probe failed', 'error');
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading telemetry analysis..." />;
  }

  if (error || !service) {
    return (
      <div className="page-wrapper">
        <ErrorState
          title="Service Not Found"
          message={error || 'The requested service record does not exist or has been removed.'}
          onRetry={() => navigate('/services')}
        />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Back button & Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/services">
            <button
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex'
              }}
              title="Back to services"
            >
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {service.name}
              </h1>
              <StatusBadge status={service.status} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-primary-light)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              <Globe size={14} />
              <span>{service.url}</span>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          icon={RefreshCw}
          loading={refreshing}
          onClick={handleManualCheck}
        >
          Execute Health Probe
        </Button>
      </div>

      {/* Calculated Service Metrics Grid */}
      <div className="metric-grid">
        <MetricCard
          title="Service Availability"
          value={`${stats?.availabilityPercentage ?? 100}%`}
          subtext={`Calculated from ${stats?.totalChecks || 0} stored checks`}
          icon={Activity}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10b981"
        />

        <MetricCard
          title="Average Latency"
          value={stats?.averageResponseTime ? `${stats.averageResponseTime} ms` : '—'}
          subtext={`Range: ${stats?.minResponseTime || 0}ms – ${stats?.maxResponseTime || 0}ms`}
          icon={Zap}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#f59e0b"
        />

        <MetricCard
          title="Successful Checks"
          value={stats?.successfulChecks || 0}
          subtext="Status UP or DEGRADED"
          icon={CheckCircle2}
          iconBg="rgba(59, 130, 246, 0.15)"
          iconColor="#3b82f6"
        />

        <MetricCard
          title="Failed Checks"
          value={stats?.failedChecks || 0}
          subtext="Network unreachable / 5xx error"
          icon={AlertTriangle}
          iconBg={stats?.failedChecks > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)'}
          iconColor={stats?.failedChecks > 0 ? '#ef4444' : 'var(--text-muted)'}
        />
      </div>

      {/* Availability Trend Bar Card */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Probe Telemetry Timeline
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Visual breakdown of consecutive probes (Green: UP, Amber: DEGRADED, Red: DOWN)
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--brand-primary-light)', fontWeight: 600 }}>
            {stats?.availabilityPercentage}% SLA
          </span>
        </div>

        <AvailabilityBar checks={healthHistory} maxBars={30} />
      </div>

      {/* Service Meta Details Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(300px, 1fr)', gap: '1.75rem', alignItems: 'start', marginBottom: '1.75rem' }}>
        {/* Health History Table */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Historical Health Probes ({healthHistory.length})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest 50 entries</span>
          </div>

          {healthHistory.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No health probes logged yet. Click "Execute Health Probe" to test now.
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>HTTP Code</th>
                    <th>Latency</th>
                    <th>Timestamp</th>
                    <th>Error Message</th>
                  </tr>
                </thead>
                <tbody>
                  {healthHistory.map((check) => (
                    <tr key={check._id}>
                      <td>
                        <StatusBadge status={check.status} />
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {check.httpStatus || '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {check.responseTime !== null ? `${check.responseTime} ms` : '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {new Date(check.checkedAt).toLocaleString()}
                      </td>
                      <td style={{ color: check.error ? 'var(--status-down)' : 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {check.error || 'None (Healthy)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Configuration Overview Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            Configuration & Metadata
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Target Environment
              </div>
              <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
                {service.environment}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Category
              </div>
              <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
                {service.category}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Expected HTTP Status
              </div>
              <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.15rem', fontFamily: 'var(--font-mono)' }}>
                {service.expectedStatusCode || 200} OK
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Description
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                {service.description || 'No description provided.'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Registered On
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                {new Date(service.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Last Successful Probe
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--status-up)', marginTop: '0.15rem' }}>
                {service.lastSuccessfulCheck ? new Date(service.lastSuccessfulCheck).toLocaleString() : 'Never'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;
