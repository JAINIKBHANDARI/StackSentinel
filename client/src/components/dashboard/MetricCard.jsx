import React from 'react';

const MetricCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconBg = 'rgba(59, 130, 246, 0.15)',
  iconColor = '#3b82f6',
  trend
}) => {
  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <span>{title}</span>
        {Icon && (
          <div className="metric-icon-wrap" style={{ background: iconBg }}>
            <Icon size={18} color={iconColor} />
          </div>
        )}
      </div>
      <div className="metric-value">{value}</div>
      {(subtext || trend) && (
        <div className="metric-sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{subtext}</span>
          {trend && <span style={{ color: trend.positive ? 'var(--status-up)' : 'var(--status-down)' }}>{trend.text}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
