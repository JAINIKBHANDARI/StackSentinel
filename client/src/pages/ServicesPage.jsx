import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  Server,
  Plus,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import ServiceCard from '../components/dashboard/ServiceCard';
import Modal from '../components/common/Modal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

const initialFormData = {
  name: '',
  description: '',
  url: '',
  environment: 'Production',
  category: 'API',
  expectedStatusCode: 200,
  active: true
};

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnv, setSelectedEnv] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [deletingService, setDeletingService] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/services');
      setServices(res.data?.data || []);
    } catch (err) {
      setError(err.userFriendlyMessage || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Check if ?add=true was passed in the URL query string
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      handleOpenCreateModal();
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormData(initialFormData);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      url: service.url,
      environment: service.environment,
      category: service.category,
      expectedStatusCode: service.expectedStatusCode || 200,
      active: service.active
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      if (editingService) {
        // Update service
        const res = await api.put(`/services/${editingService._id}`, formData);
        if (res.data?.success) {
          addToast('Service updated successfully', 'success');
          setServices((prev) =>
            prev.map((s) => (s._id === editingService._id ? res.data.data : s))
          );
          setIsModalOpen(false);
        }
      } else {
        // Create service
        const res = await api.post('/services', formData);
        if (res.data?.success) {
          addToast('Service registered and initial health probe triggered', 'success');
          setServices((prev) => [res.data.data, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      setFormError(err.userFriendlyMessage || 'Failed to save service');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    if (!deletingService) return;
    setDeleteSubmitting(true);
    try {
      await api.delete(`/services/${deletingService._id}`);
      addToast('Service and telemetry history deleted', 'success');
      setServices((prev) => prev.filter((s) => s._id !== deletingService._id));
      setDeletingService(null);
    } catch (err) {
      addToast(err.userFriendlyMessage || 'Failed to delete service', 'error');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleCheckService = async (serviceId) => {
    try {
      const res = await api.post(`/services/${serviceId}/check`);
      if (res.data?.success) {
        const updated = res.data.data.service;
        setServices((prev) =>
          prev.map((s) => (s._id === updated._id ? { ...s, ...updated } : s))
        );
        addToast(`Probe finished: ${updated.status} (${updated.lastResponseTime}ms)`, 'success');
      }
    } catch (err) {
      addToast(err.userFriendlyMessage || 'Probe failed', 'error');
    }
  };

  // Filtered services
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.url.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEnv = selectedEnv === 'ALL' || s.environment === selectedEnv;
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

    return matchesSearch && matchesEnv && matchesCategory && matchesStatus;
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Registered Services & APIs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Manage endpoints, health rules, and trigger active HTTP latency checks
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenCreateModal}>
          Register New Service
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by service name or endpoint URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="API">API</option>
            <option value="Database">Database</option>
            <option value="Third-party">Third-party</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="UP">UP</option>
            <option value="DEGRADED">DEGRADED</option>
            <option value="DOWN">DOWN</option>
            <option value="UNKNOWN">UNKNOWN</option>
          </select>
        </div>
      </div>

      {/* Content State */}
      {loading ? (
        <LoadingSpinner message="Loading services list..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchServices} />
      ) : filteredServices.length === 0 ? (
        <EmptyState
          title={services.length === 0 ? "No services registered" : "No matching services found"}
          description={services.length === 0
            ? "Register your application microservices or API health endpoints to begin monitoring."
            : "No services matched your current search filters. Try adjusting your query or environment filters."}
          actionLabel={services.length === 0 ? "Register First Service" : "Clear Filters"}
          onAction={services.length === 0 ? handleOpenCreateModal : () => { setSearchQuery(''); setSelectedEnv('ALL'); setSelectedCategory('ALL'); setSelectedStatus('ALL'); }}
        />
      ) : (
        <div className="service-grid">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              onCheck={handleCheckService}
              onEdit={handleOpenEditModal}
              onDelete={(s) => setDeletingService(s)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Monitored Service' : 'Register New Application Service'}
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

        <form onSubmit={handleFormSubmit}>
          <Input
            label="Service Name"
            placeholder="e.g. Payment Gateway Service"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Endpoint URL"
            placeholder="https://api.domain.com/health"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
            helper="StackSentinel will send HTTP GET probes to this target URL"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Select
              label="Environment"
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              options={[
                { value: 'Production', label: 'Production' },
                { value: 'Staging', label: 'Staging' },
                { value: 'Development', label: 'Development' }
              ]}
            />

            <Select
              label="Service Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: 'Frontend', label: 'Frontend' },
                { value: 'Backend', label: 'Backend' },
                { value: 'API', label: 'API Gateway / Microservice' },
                { value: 'Database', label: 'Database' },
                { value: 'Third-party', label: 'Third-Party Integration' }
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            <Input
              label="Expected HTTP Status Code"
              type="number"
              value={formData.expectedStatusCode}
              onChange={(e) => setFormData({ ...formData, expectedStatusCode: e.target.value })}
              required
              helper="Usually 200 (OK). Anything other than this code is marked DOWN."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Brief summary of microservice responsibility..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={formSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formSubmitting}>
              {editingService ? 'Save Changes' : 'Register & Probe'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingService}
        onClose={() => setDeletingService(null)}
        onConfirm={handleDeleteService}
        loading={deleteSubmitting}
        title="Delete Monitored Service?"
        message={`Are you sure you want to delete "${deletingService?.name}"? All associated health check history and metrics will be permanently purged.`}
        confirmText="Delete Service"
      />
    </div>
  );
};

export default ServicesPage;
