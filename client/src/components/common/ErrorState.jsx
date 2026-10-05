import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Failed to load telemetry data',
  message = 'An unexpected error occurred while communicating with the StackSentinel API server.',
  onRetry
}) => {
  return (
    <div className="empty-state" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
      <div className="empty-state-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
        <AlertCircle size={28} />
      </div>
      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
        {title}
      </h4>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', fontSize: '0.88rem', marginBottom: onRetry ? '1.25rem' : 0 }}>
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
