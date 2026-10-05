import React from 'react';
import { Activity, GitBranch, Server, AlertCircle, CheckCircle2 } from 'lucide-react';

const ActivityFeed = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No recent activities logged yet.
      </div>
    );
  }

  const getIcon = (type, status) => {
    if (type === 'HEALTH_CHECK') {
      if (status === 'UP') return <CheckCircle2 size={16} color="#10b981" />;
      if (status === 'DEGRADED') return <AlertCircle size={16} color="#f59e0b" />;
      return <AlertCircle size={16} color="#ef4444" />;
    }
    if (type === 'DEPLOYMENT') {
      return <GitBranch size={16} color="#3b82f6" />;
    }
    return <Server size={16} color="#8b5cf6" />;
  };

  const getIconBg = (type, status) => {
    if (type === 'HEALTH_CHECK') {
      if (status === 'UP') return 'rgba(16, 185, 129, 0.12)';
      if (status === 'DEGRADED') return 'rgba(245, 158, 11, 0.12)';
      return 'rgba(239, 68, 68, 0.12)';
    }
    if (type === 'DEPLOYMENT') return 'rgba(59, 130, 246, 0.12)';
    return 'rgba(139, 92, 246, 0.12)';
  };

  return (
    <div className="activity-feed-list">
      {activities.map((act) => (
        <div key={act.id} className="activity-item">
          <div className="activity-icon" style={{ background: getIconBg(act.type, act.status) }}>
            {getIcon(act.type, act.status)}
          </div>
          <div className="activity-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="activity-title">{act.title}</span>
              <span className="activity-time">{new Date(act.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="activity-desc">{act.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
