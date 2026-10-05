import React from 'react';

const AvailabilityBar = ({ checks = [], maxBars = 24 }) => {
  // If no checks, generate placeholder neutral segments
  const displayChecks = checks.slice(0, maxBars).reverse();
  const emptySlots = Math.max(0, maxBars - displayChecks.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          height: '24px',
          width: '100%'
        }}
      >
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{
              flex: 1,
              height: '100%',
              borderRadius: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)'
            }}
            title="No check record"
          />
        ))}

        {displayChecks.map((check, idx) => {
          let bg = 'var(--status-up)';
          if (check.status === 'DEGRADED') bg = 'var(--status-degraded)';
          if (check.status === 'DOWN') bg = 'var(--status-down)';
          if (check.status === 'UNKNOWN') bg = 'var(--status-unknown)';

          const tooltip = `${check.status} • ${check.responseTime || 0}ms • HTTP ${check.httpStatus || 'N/A'}\n${new Date(check.checkedAt).toLocaleTimeString()}`;

          return (
            <div
              key={check._id || idx}
              style={{
                flex: 1,
                height: '100%',
                borderRadius: '2px',
                backgroundColor: bg,
                opacity: 0.85,
                transition: 'transform 0.15s ease, opacity 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scaleY(1.2)';
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scaleY(1)';
                e.currentTarget.style.opacity = '0.85';
              }}
              title={tooltip}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span>Earlier</span>
        <span>Latest</span>
      </div>
    </div>
  );
};

export default AvailabilityBar;
