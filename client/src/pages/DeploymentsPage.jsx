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
  Layers
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

  const fetchDeployments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [depRes, srvRes] = await Promise.all([
        api.get('/deployments'),
        api.get('/services')
      ]);

      setDeployments(depRes.data?.data || []);
      const serviceList = srvRes.data?.data || [];
      setServices(serviceList);

      if (serviceList.length > 0 && !formData.serviceId) {
        setFormData((prev) => ({ ...prev, serviceId: serviceList[0]._id }));
      }
    } catch (err) {
      setError(err.userFriendlyMessage || 'Failed to load deployments');
    } finally {
      setLoading(false);
    }
  }, []);

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

        <Button
          variant="primary"
          icon={Play}
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
          Simulate Build / Release
        </Button>
      </div>

      {/* CI/CD Info Notice */}
      <div
        className="card"
        style={{
          background: 'rgba(59, 130, 246, 0.08)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.65rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>
          <Terminal size={22} color="var(--brand-primary-light)" />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.2rem' }}>
            Pipeline Schema: Ready for Jenkins Webhooks
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            StackSentinel's deployment model stores commit hashes, branches, build durations, and trigger metadata.
            In future milestones, Jenkins pipelines will automatically POST execution results to this endpoint.
          </p>
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
    </div>
  );
};

export default DeploymentsPage;
