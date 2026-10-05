import React from 'react';

const StatusBadge = ({ status = 'UNKNOWN', className = '' }) => {
  const normalized = status ? status.toUpperCase() : 'UNKNOWN';

  return (
    <span className={`status-pill ${normalized} ${className}`}>
      <span className={`indicator-dot ${normalized}`} />
      <span>{normalized}</span>
    </span>
  );
};

export default StatusBadge;
