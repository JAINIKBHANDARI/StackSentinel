import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Settings, Bell, Sliders, Shield, Terminal, Save } from 'lucide-react';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';

const SettingsPage = () => {
  const { addToast } = useToast();

  const [pollingInterval, setPollingInterval] = useState('30');
  const [latencyThreshold, setLatencyThreshold] = useState('800');
  const [requestTimeout, setRequestTimeout] = useState('6000');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [jenkinsSecret, setJenkinsSecret] = useState('stacksentinel_jenkins_secret_2026');
  const [jenkinsServerUrl, setJenkinsServerUrl] = useState('');
  const [saving, setSaving] = useState(false);


  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast('Monitoring engine settings updated successfully', 'success');
    }, 400);
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Monitoring Engine Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
          Configure probe intervals, degradation latency thresholds, and notification webhooks
        </p>
      </div>

      <form onSubmit={handleSave}>
        {/* Probe Thresholds */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={18} color="var(--brand-primary-light)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Probe & Latency Rules
              </h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              label="Telemetry Heartbeat Rate"
              value={pollingInterval}
              onChange={(e) => setPollingInterval(e.target.value)}
              options={[
                { value: '15', label: 'Every 15 seconds' },
                { value: '30', label: 'Every 30 seconds (Default)' },
                { value: '60', label: 'Every 1 minute' },
                { value: '300', label: 'Every 5 minutes' }
              ]}
              helper="Frequency of UI status refreshes"
            />

            <Input
              label="Degraded Latency Threshold (ms)"
              type="number"
              value={latencyThreshold}
              onChange={(e) => setLatencyThreshold(e.target.value)}
              helper="Responses slower than this are flagged as DEGRADED (800ms default)"
            />
          </div>

          <Input
            label="HTTP Request Timeout (ms)"
            type="number"
            value={requestTimeout}
            onChange={(e) => setRequestTimeout(e.target.value)}
            helper="Checks taking longer than this will abort and report as DOWN (6000ms default)"
          />
        </div>

        {/* Alert Notifications */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="var(--brand-primary-light)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Incident Alert Notifications
              </h3>
            </div>
          </div>

          <Input
            label="Discord / Slack Incident Webhook URL (Optional)"
            placeholder="https://discord.com/api/webhooks/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            helper="StackSentinel will dispatch alert payloads when a service transitions to DOWN"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="emailAlerts"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              style={{ accentColor: 'var(--brand-primary)', width: '16px', height: '16px' }}
            />
            <label htmlFor="emailAlerts" style={{ fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Send critical downtime digest emails to registered team members
            </label>
          </div>
        </div>

        {/* Jenkins CI/CD Automation Webhook */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={18} color="var(--brand-primary-light)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Jenkins CI/CD Pipeline Webhook
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', background: 'var(--status-up-bg)', color: 'var(--status-up)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--status-up-border)', fontWeight: 600 }}>
              Enabled
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Jenkins Webhook Secret Token"
              type="text"
              value={jenkinsSecret}
              onChange={(e) => setJenkinsSecret(e.target.value)}
              helper="Expected in the 'x-jenkins-token' HTTP request header"
            />

            <Input
              label="Jenkins Server URL (Optional)"
              type="text"
              placeholder="http://jenkins.internal:8080"
              value={jenkinsServerUrl}
              onChange={(e) => setJenkinsServerUrl(e.target.value)}
              helper="Base URL to link build numbers directly to your Jenkins console"
            />
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Pipeline Target: <code style={{ color: '#38bdf8' }}>POST /api/deployments/jenkins</code> — Automated builds in your <code style={{ color: '#f8fafc' }}>Jenkinsfile</code> dispatch test suites and bundle builds directly to StackSentinel.
          </div>
        </div>

        {/* Architecture Specs */}
        <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(11, 15, 23, 0.4)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            System Environment Architecture
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>Frontend: <strong>React 18 + Vite (Vercel)</strong></div>
            <div>Backend: <strong>Express + Node.js (Vercel / Render)</strong></div>
            <div>Database: <strong>MongoDB Atlas (Mongoose ODM)</strong></div>
            <div>CI/CD Pipeline: <strong>Jenkins Declarative Pipeline (Active)</strong></div>
          </div>
        </div>


        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" icon={Save} loading={saving}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
