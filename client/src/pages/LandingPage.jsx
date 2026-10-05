import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Activity,
  Zap,
  GitBranch,
  Layers,
  ArrowRight,
  Server,
  CheckCircle2,
  Terminal,
  Database
} from 'lucide-react';
import Button from '../components/common/Button';
import Footer from '../components/common/Footer';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header className="top-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              padding: '0.45rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 0 12px rgba(37, 99, 235, 0.4)'
            }}
          >
            <ShieldCheck size={20} color="#ffffff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Stack<span style={{ color: 'var(--brand-primary-light)' }}>Sentinel</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="primary" icon={ArrowRight}>
                Open Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 1.5rem 4rem 1.5rem',
          textAlign: 'center',
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: 'var(--brand-primary-light)',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '1.75rem'
          }}
        >
          <Zap size={14} />
          <span>Application Stack Monitoring & CI/CD Platform</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            background: 'linear-gradient(180deg, #ffffff 40%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Know Your Stack.<br />Before Your Users Do.
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6
          }}
        >
          StackSentinel is an enterprise-grade observability and CI/CD readiness platform.
          Register application APIs, observe health probes in real-time, diagnose latency degradation,
          and track deployment releases from one unified command console.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register">
            <Button variant="primary" size="lg" icon={ArrowRight}>
              Get Started Free
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Explore Demo Platform
            </Button>
          </Link>
        </div>

        {/* Live Status Mockup Preview */}
        <div
          style={{
            marginTop: '3.5rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-bright)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                sentinel-engine://telemetry/live-cluster
              </span>
            </div>
            <span className="status-pill UP">ALL SYSTEMS OPERATIONAL</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SERVICES MONITORED</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>6 Services</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--status-up)', marginTop: '0.2rem' }}>100% Core Uptime</div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AVG RESPONSE TIME</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>134 ms</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--status-up)', marginTop: '0.2rem' }}>Low Latency</div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DEPLOYMENT PIPELINE</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>Jenkins Ready</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary-light)', marginTop: '0.2rem' }}>CI/CD Schema Valid</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Built for Modern DevOps & High-Availability Stacks
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Full observability across microservices, databases, gateways, and build triggers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Activity size={22} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                Real-Time Health Probes
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Active HTTP health probes evaluate endpoint response codes, connection handshakes, and network timeouts safely.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Zap size={22} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                API Response Monitoring
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Automatic degradation detection when latency exceeds predefined thresholds, keeping you ahead of outages.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <GitBranch size={22} color="#3b82f6" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                Deployment Visibility
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Track release commits, branches, deployment durations, and build statuses pre-configured for future Jenkins CI/CD integration.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Layers size={22} color="#8b5cf6" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                Centralized Dashboard
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Aggregated metrics calculate actual historical uptime percentages, live activity feeds, and multi-environment filtering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Flow Section */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
            System Architecture Flow
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Simulating enterprise developer and DevOps telemetry flows
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            position: 'relative'
          }}
        >
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div style={{ width: '40px', height: '40px', margin: '0 auto 0.75rem auto', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={20} color="#3b82f6" />
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', marginBottom: '0.25rem' }}>1. Service Ingress</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>User registers endpoint URL, target HTTP status code, & environment</div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div style={{ width: '40px', height: '40px', margin: '0 auto 0.75rem auto', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} color="#10b981" />
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', marginBottom: '0.25rem' }}>2. Health Engine</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Safe HTTP probes measure roundtrip latency & HTTP response codes</div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div style={{ width: '40px', height: '40px', margin: '0 auto 0.75rem auto', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={20} color="#f59e0b" />
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', marginBottom: '0.25rem' }}>3. MongoDB Storage</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Persists time-series health logs and computes true availability %</div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div style={{ width: '40px', height: '40px', margin: '0 auto 0.75rem auto', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GitBranch size={20} color="#8b5cf6" />
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', marginBottom: '0.25rem' }}>4. CI/CD Ready</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Build models structured for future Jenkins pipeline automation</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
