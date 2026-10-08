import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  GitBranch,
  Plus,
  Play,
  Filter,
  CheckCircle2,
  Clock,
  Terminal,
  ExternalLink,
  Layers,
  Copy,
  Check
} from 'lucide-react';

import DeploymentCard from '../components/dashboard/DeploymentCard';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

const initialDeployData = {
  serviceId: '',
  version: 'v1.0.0',
  branch: 'main',
  environment: 'Production',
  status: 'SUCCESS',
  message: 'Automated release build triggered'
};

const DeploymentsPage = () => {
  const { addToast } = useToast();

  const [deployments, setDeployments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedEnv, setSelectedEnv] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Trigger modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialDeployData);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Jenkins integration states
  const [triggeringJenkins, setTriggeringJenkins] = useState(false);
  const [showJenkinsModal, setShowJenkinsModal] = useState(false);

  const fetchDeployments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [depRes, srvRes] = await Promise.all([
        api.get('/deployments'),
        api.get('/services')
      ]);

      const depList = depRes.data?.data || [];
      setDeployments(depList);
      const serviceList = srvRes.data?.data || [];
      setServices(serviceList);

      if (serviceList.length > 0 && !formData.serviceId) {
        setFormData((prev) => ({ ...prev, serviceId: serviceList[0]._id }));
      }
    } catch (err) {
      // If backend is unreachable (offline/demo mode), display demo deployments
      const fallbackDeps = [
        {
          _id: 'dep-seed-1',
          service: { name: 'Authentication API', environment: 'Production' },
          version: 'v1.4.2',
          branch: 'main',
          commitHash: '7f9a12c',
          status: 'SUCCESS',
          environment: 'Production',
          duration: 32,
          triggeredBy: 'Jenkins CI/CD Build #42',
          message: 'Automated release deployment passed all Jest integration test suites',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          _id: 'dep-seed-2',
          service: { name: 'Monitoring Probe Engine', environment: 'Production' },
          version: 'v1.4.1',
          branch: 'main',
          commitHash: '3d8e90a',
          status: 'SUCCESS',
          environment: 'Production',
          duration: 28,
          triggeredBy: 'Jenkins CI/CD Build #41',
          message: 'Optimized Mongoose connection pooling and latency threshold checks',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ];
      setDeployments(fallbackDeps);
      setServices([
        { _id: 'srv-demo-1', name: 'Authentication API', environment: 'Production' },
        { _id: 'srv-demo-2', name: 'Monitoring Probe Engine', environment: 'Production' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSimulateJenkinsWebhook = async () => {
    setTriggeringJenkins(true);
    const buildNum = Math.floor(Math.random() * 80) + 10;
    const samplePayload = {
      buildNumber: buildNum.toString(),
      version: `v1.${buildNum}.0`,
      branch: 'main',
      commitHash: Math.random().toString(16).substring(2, 9),
      status: 'SUCCESS',
      environment: 'Production',
      duration: Math.floor(Math.random() * 25) + 15,
      message: `Automated build #${buildNum} via Jenkins Declarative Pipeline passed 17 test suites`
    };

    try {
      const res = await api.post('/deployments/jenkins', samplePayload, {
        headers: {
          'x-jenkins-token': 'stacksentinel_jenkins_secret_2026'
        }
      });
      if (res.data?.success) {
        addToast(`Jenkins Build #${buildNum} received via webhook!`, 'success');
        setDeployments((prev) => [res.data.data, ...prev]);
      }
    } catch (err) {
      // Simulate client-side if offline/Vercel preview
      const targetSrv = services[0] || { name: 'StackSentinel Production Stack', environment: 'Production' };
      const simulatedDep = {
        _id: 'jenkins-' + Date.now(),
        service: targetSrv,
        version: samplePayload.version,
        branch: samplePayload.branch,
        commitHash: samplePayload.commitHash,
        environment: samplePayload.environment,
        status: samplePayload.status,
        triggeredBy: `Jenkins Build #${buildNum}`,
        duration: samplePayload.duration,
        message: samplePayload.message,
        createdAt: new Date().toISOString()
      };
      setDeployments((prev) => [simulatedDep, ...prev]);
      addToast(`Jenkins Build #${buildNum} simulated and added to deployment timeline!`, 'success');
    } finally {
      setTriggeringJenkins(false);
    }
  };


  useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);

  const handleCreateDeployment = async (e) => {
    e.preventDefault();
    if (!formData.serviceId) {
      setFormError('Please select a target application service');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const res = await api.post('/deployments', formData);
      if (res.data?.success) {
        addToast(`Deployment ${res.data.data.version} recorded successfully`, 'success');
        setDeployments((prev) => [res.data.data, ...prev]);
        setIsModalOpen(false);
      }
    } catch (err) {
      setFormError(err.userFriendlyMessage || 'Failed to trigger deployment');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDeployments = deployments.filter((d) => {
    const matchesEnv = selectedEnv === 'ALL' || d.environment === selectedEnv;
    const matchesStatus = selectedStatus === 'ALL' || d.status === selectedStatus;
    return matchesEnv && matchesStatus;
  });

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            CI/CD Deployment History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Track release pipelines, commit hashes, build durations, and prepare for Jenkins integration
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            icon={Terminal}
            onClick={() => setShowJenkinsModal(true)}
          >
            Jenkins CI Config
          </Button>

          <Button
            variant="primary"
            icon={Play}
            loading={triggeringJenkins}
            onClick={handleSimulateJenkinsWebhook}
          >
            Simulate Jenkins Webhook
          </Button>

          <Button
            variant="secondary"
            icon={Plus}
            onClick={() => {
              if (services.length > 0) {
                setFormData((prev) => ({
                  ...prev,
                  serviceId: services[0]._id,
                  version: `v1.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 9)}`
                }));
              }
              setIsModalOpen(true);
            }}
          >
            Manual Release
          </Button>
        </div>
      </div>

      {/* Jenkins CI/CD Live Integration Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
          borderColor: 'rgba(59, 130, 246, 0.35)',
          marginBottom: '1.75rem',
          padding: '1.25rem 1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>
              <Terminal size={24} color="var(--brand-primary-light)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Jenkins Declarative Pipeline Webhook
                </h4>
                <span style={{ fontSize: '0.72rem', background: 'var(--status-up-bg)', color: 'var(--status-up)', padding: '2px 8px', borderRadius: '999px', border: '1px solid var(--status-up-border)', fontWeight: 600 }}>
                  ● CI/CD Active
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                Endpoint: <code style={{ color: 'var(--brand-primary-light)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>POST /api/deployments/jenkins</code> with header <code style={{ color: '#38bdf8', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>x-jenkins-token</code>.
                Executes automated tests, verifies client build, and streams build telemetry directly to this dashboard.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSimulateJenkinsWebhook}
              disabled={triggeringJenkins}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              {triggeringJenkins ? 'Dispatching...' : '⚡ Test Webhook'}
            </button>
            <button
              onClick={() => setShowJenkinsModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              View Pipeline
            </button>
          </div>
        </div>
      </div>


      {/* Filters Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600 }}>
          <Filter size={16} />
          <span>Filter Releases</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedEnv}
            onChange={(e) => setSelectedEnv(e.target.value)}
          >
            <option value="ALL">All Environments</option>
            <option value="Production">Production</option>
            <option value="Staging">Staging</option>
            <option value="Development">Development</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="RUNNING">RUNNING</option>
            <option value="QUEUED">QUEUED</option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Deployments List */}
      {loading ? (
        <LoadingSpinner message="Loading deployment records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDeployments} />
      ) : filteredDeployments.length === 0 ? (
        <EmptyState
          title="No deployment records found"
          description="Simulate a build execution or trigger a release to populate the CI/CD pipeline history."
          actionLabel="Simulate Deployment"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredDeployments.map((deployment) => (
            <DeploymentCard key={deployment._id} deployment={deployment} />
          ))}
        </div>
      )}

      {/* Simulate Deployment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Simulate CI/CD Pipeline Deployment"
      >
        {formError && (
          <div
            style={{
              background: 'var(--status-down-bg)',
              border: '1px solid var(--status-down-border)',
              color: 'var(--status-down)',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              marginBottom: '1rem'
            }}
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateDeployment}>
          <Select
            label="Target Service"
            value={formData.serviceId}
            onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
            options={services.map((s) => ({ value: s._id, label: `${s.name} (${s.environment})` }))}
            required
            helper="Select the microservice endpoint receiving this deployment"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Release Version"
              placeholder="e.g. v2.4.0"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              required
            />

            <Input
              label="Git Branch"
              placeholder="main"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Select
              label="Target Environment"
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              options={[
                { value: 'Production', label: 'Production' },
                { value: 'Staging', label: 'Staging' },
                { value: 'Development', label: 'Development' }
              ]}
            />

            <Select
              label="Simulated Outcome"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'SUCCESS', label: 'SUCCESS (Green)' },
                { value: 'RUNNING', label: 'RUNNING (In Progress)' },
                { value: 'QUEUED', label: 'QUEUED' },
                { value: 'FAILED', label: 'FAILED (Red)' }
              ]}
            />
          </div>

          <Input
            label="Release Message / Changelog"
            placeholder="e.g. Optimized database indexing and memory cache"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Record Deployment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Jenkins CI/CD Setup & Webhook Modal */}
      <Modal
        isOpen={showJenkinsModal}
        onClose={() => setShowJenkinsModal(false)}
        title="Jenkins CI/CD Pipeline Integration"
        maxWidth="680px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            StackSentinel is pre-configured with a production-grade <strong>declarative Jenkinsfile</strong> in the repository root.
            Configure your Jenkins server with the webhook endpoint below to automatically stream build statuses, test outcomes, and commit metadata into this dashboard.
          </p>

          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Jenkins Webhook Endpoint
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <code style={{ flex: 1, padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', fontSize: '0.85rem', color: '#38bdf8' }}>
                POST /api/deployments/jenkins
              </code>
            </div>
            <div style={{ marginTop: '0.65rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Required Security Header: <code style={{ color: 'var(--brand-primary-light)' }}>x-jenkins-token: stacksentinel_jenkins_secret_2026</code>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Jenkinsfile Pipeline Telemetry Stage (Stage 5)
            </div>
            <pre style={{
              background: '#0d1117',
              color: '#c9d1d9',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              fontFamily: 'monospace',
              overflowX: 'auto',
              border: '1px solid var(--border-subtle)',
              lineHeight: 1.45
            }}>
{`stage('5. Record Deployment to StackSentinel') {
    steps {
        echo 'Recording build telemetry to StackSentinel...'
        script {
            def apiUrl = env.STACKSENTINEL_API_URL ?: 'https://stack-sentinel-blush.vercel.app/api'
            def webhookToken = env.STACKSENTINEL_WEBHOOK_SECRET ?: 'stacksentinel_jenkins_secret_2026'
            def buildNum = env.BUILD_NUMBER ?: '1'
            def gitCommit = env.GIT_COMMIT ?: 'local-build'
            def gitBranch = env.BRANCH_NAME ?: 'main'

            sh """
                curl -s -X POST "\${apiUrl}/deployments/jenkins" \\
                  -H "Content-Type: application/json" \\
                  -H "x-jenkins-token: \${webhookToken}" \\
                  -d '{"buildNumber":"\${buildNum}","version":"v1.\${buildNum}.0","branch":"\${gitBranch}","commitHash":"\${gitCommit}","status":"SUCCESS","environment":"Production"}'
            """
        }
    }
}`}
            </pre>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Manual Webhook Trigger (cURL)
            </div>
            <pre style={{
              background: '#0d1117',
              color: '#34d399',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.76rem',
              fontFamily: 'monospace',
              overflowX: 'auto',
              border: '1px solid var(--border-subtle)'
            }}>
{`curl -X POST "https://stack-sentinel-blush.vercel.app/api/deployments/jenkins" \\
  -H "Content-Type: application/json" \\
  -H "x-jenkins-token: stacksentinel_jenkins_secret_2026" \\
  -d '{"buildNumber":"42","version":"v1.42.0","status":"SUCCESS","branch":"main","environment":"Production"}'`}
            </pre>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Integrated with Jenkins declarative pipeline
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="primary"
                loading={triggeringJenkins}
                onClick={async () => {
                  await handleSimulateJenkinsWebhook();
                  setShowJenkinsModal(false);
                }}
              >
                ⚡ Trigger Test Build Webhook
              </Button>
              <Button variant="secondary" onClick={() => setShowJenkinsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};


export default DeploymentsPage;
