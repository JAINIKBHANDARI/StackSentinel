import React from 'react';

const HealthIndicator = ({ status = 'UNKNOWN', size = 'md' }) => {
  const normalized = status ? status.toUpperCase() : 'UNKNOWN';

  const dotSizes = {
    sm: { width: '6px', height: '6px' },
    md: { width: '10px', height: '10px' },
    lg: { width: '14px', height: '14px' }
  };

  return (
    <span
      className={`indicator-dot ${normalized}`}
      style={dotSizes[size] || dotSizes.md}
      title={`Health Status: ${normalized}`}
    />
  );
};

export default HealthIndicator;
