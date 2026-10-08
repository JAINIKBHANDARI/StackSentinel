import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, LogIn, Key, Mail, Sparkles } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, loginDemo } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await login(email, password);
      addToast('Signed in successfully', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.userFriendlyMessage || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const populateDemo = (role) => {
    if (role === 'ADMIN') {
      setEmail('admin@stacksentinel.io');
      setPassword('Admin@Password123');
    } else {
      setEmail('dev@stacksentinel.io');
      setPassword('Dev@Password123');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-bright)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 1rem auto',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(37, 99, 235, 0.4)'
            }}
          >
            <ShieldCheck size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Authenticate to access the StackSentinel telemetry console
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              background: 'var(--status-down-bg)',
              border: '1px solid var(--status-down-border)',
              color: 'var(--status-down)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            placeholder="developer@stacksentinel.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            icon={LogIn}
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* Demo Credentials & Instant Cloud Preview */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
              <Sparkles size={13} color="var(--brand-primary-light)" />
              <span>Instant Cloud Demo (No Setup Needed)</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--status-up)', background: 'var(--status-up-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--status-up-border)' }}>
              Live Vercel Preview
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                loginDemo('ADMIN');
                addToast('Signed in as Administrator (Demo Mode)', 'success');
                navigate('/dashboard', { replace: true });
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', justifyContent: 'center', borderColor: 'rgba(59, 130, 246, 0.4)' }}
            >
              ⚡ Instant Admin
            </button>
            <button
              type="button"
              onClick={() => {
                loginDemo('USER');
                addToast('Signed in as Developer (Demo Mode)', 'success');
                navigate('/dashboard', { replace: true });
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', justifyContent: 'center' }}
            >
              ⚡ Instant Developer
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.73rem' }}>
            <span>Auto-fill MongoDB Seed Credentials:</span>
            <button
              type="button"
              onClick={() => populateDemo('ADMIN')}
              style={{ background: 'none', border: 'none', color: 'var(--brand-primary-light)', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: '0.73rem' }}
            >
              Admin
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => populateDemo('USER')}
              style={{ background: 'none', border: 'none', color: 'var(--brand-primary-light)', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: '0.73rem' }}
            >
              Dev
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--brand-primary-light)', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};


export default LoginPage;
