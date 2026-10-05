import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Mail, Key, Calendar, CheckCircle2 } from 'lucide-react';
import Button from '../components/common/Button';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          User Profile & Security
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
          Your authenticated developer identity and API token credentials
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.75rem',
              fontWeight: 800,
              boxShadow: '0 0 16px rgba(37, 99, 235, 0.3)'
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user?.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span
                style={{
                  background: user?.role === 'ADMIN' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: user?.role === 'ADMIN' ? 'var(--brand-primary-light)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.15rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
              >
                {user?.role} ROLE
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• Standard Token Auth</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Email Address
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
              <Mail size={14} color="var(--brand-primary-light)" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Account Created
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', marginTop: '0.25rem', fontSize: '0.88rem' }}>
              <Calendar size={14} color="var(--brand-primary-light)" />
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Access Tokens preview */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Developer JWT Session Token
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Use this bearer token to interact directly with the StackSentinel REST API endpoints
            </p>
          </div>
          <Key size={18} color="var(--brand-primary-light)" />
        </div>

        <div
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: 'var(--brand-primary-light)',
            wordBreak: 'break-all',
            marginBottom: '1rem'
          }}
        >
          {localStorage.getItem('stacksentinel_token') || 'Token active in session storage'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-up)', fontSize: '0.8rem' }}>
          <CheckCircle2 size={16} />
          <span>Active JSON Web Token with HMAC SHA-256 signature</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
