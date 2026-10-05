import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import {
  ExternalLink,
  RefreshCw,
  Clock,
  CheckCircle,
  Eye,
  Trash2,
  Edit,
  Globe
} from 'lucide-react';

const ServiceCard = ({
  service,
  onCheck,
  onEdit,
  onDelete
}) => {
  const [checking, setChecking] = useState(false);

  const handleQuickCheck = async (e) => {
    e.stopPropagation();
    if (!onCheck) return;
    setChecking(true);
    try {
      await onCheck(service._id);
    } finally {
      setChecking(false);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="service-card">
      <div>
        <div className="service-card-header">
          <div>
            <h3 className="service-title">{service.name}</h3>
            <div className="service-url">
              <Globe size={13} />
              <span>{service.url}</span>
            </div>
          </div>
          <StatusBadge status={service.status} />
        </div>

        <div className="service-meta-row">
          <span className="service-tag" style={{ color: 'var(--brand-primary-light)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            {service.environment}
          </span>
          <span className="service-tag">{service.category}</span>
          <span className="service-tag">Exp: {service.expectedStatusCode || 200}</span>
        </div>

        {service.description && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
            {service.description}
          </p>
        )}

        <div className="service-stats-grid">
          <div className="service-stat-item">
            <span className="service-stat-label">Response Time</span>
            <span className="service-stat-val">
              {service.lastResponseTime !== null && service.lastResponseTime !== undefined
                ? `${service.lastResponseTime} ms`
                : '—'}
            </span>
          </div>
          <div className="service-stat-item">
            <span className="service-stat-label">HTTP Code</span>
            <span className="service-stat-val">
              {service.lastHttpStatus || '—'}
            </span>
          </div>
          <div className="service-stat-item">
            <span className="service-stat-label">Last Checked</span>
            <span className="service-stat-val" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {formatTimeAgo(service.lastChecked)}
            </span>
          </div>
          <div className="service-stat-item">
            <span className="service-stat-label">Last Success</span>
            <span className="service-stat-val" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {formatTimeAgo(service.lastSuccessfulCheck)}
            </span>
          </div>
        </div>
      </div>

      <div className="service-card-actions">
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={checking}
            onClick={handleQuickCheck}
            title="Trigger immediate health check"
          >
            Check
          </Button>
          <Link to={`/services/${service._id}`}>
            <Button variant="secondary" size="sm" icon={Eye}>
              Details
            </Button>
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {onEdit && (
            <button
              onClick={() => onEdit(service)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem',
                cursor: 'pointer',
                display: 'flex'
              }}
              title="Edit service configuration"
            >
              <Edit size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(service)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: '#ef4444',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem',
                cursor: 'pointer',
                display: 'flex'
              }}
              title="Delete service"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
