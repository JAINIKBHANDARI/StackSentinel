import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { GitCommit, GitBranch, Clock, User, Timer } from 'lucide-react';

const DeploymentCard = ({ deployment }) => {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {deployment.service?.name || 'Service'}
          </span>
          <span
            style={{
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.15rem 0.45rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--brand-primary-light)'
            }}
          >
            {deployment.version}
          </span>
        </div>
        <StatusBadge status={deployment.status} />
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        {deployment.message || 'Automated deployment event'}
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.65rem'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <GitBranch size={14} /> {deployment.branch}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-mono)' }}>
          <GitCommit size={14} /> {deployment.commitHash?.substring(0, 7)}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <User size={14} /> {deployment.triggeredBy}
        </span>
        {deployment.duration && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Timer size={14} /> {deployment.duration}s
          </span>
        )}
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={14} /> {new Date(deployment.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default DeploymentCard;
