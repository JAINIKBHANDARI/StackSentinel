// Client-side API simulator for cloud hosting (Vercel) when backend is serverless or static
const MOCK_STORAGE_KEYS = {
  SERVICES: 'stacksentinel_mock_services',
  DEPLOYMENTS: 'stacksentinel_mock_deployments',
  USERS: 'stacksentinel_mock_users'
};

const getDefaultServices = () => [
  {
    _id: 'srv-101',
    name: 'GitHub Public API',
    url: 'https://api.github.com',
    environment: 'Production',
    category: 'API Gateway',
    expectedStatusCode: 200,
    status: 'UP',
    lastHttpStatus: 200,
    lastResponseTime: 48,
    lastChecked: new Date().toISOString(),
    uptime: 99.9,
    active: true
  },
  {
    _id: 'srv-102',
    name: 'User Identity & Auth Service',
    url: 'https://auth.stacksentinel.io/status',
    environment: 'Production',
    category: 'Microservice',
    expectedStatusCode: 200,
    status: 'UP',
    lastHttpStatus: 200,
    lastResponseTime: 62,
    lastChecked: new Date().toISOString(),
    uptime: 100.0,
    active: true
  },
  {
    _id: 'srv-103',
    name: 'Payment & Billing Gateway',
    url: 'https://billing.stacksentinel.io/healthz',
    environment: 'Production',
    category: 'Billing',
    expectedStatusCode: 200,
    status: 'UP',
    lastHttpStatus: 200,
    lastResponseTime: 115,
    lastChecked: new Date().toISOString(),
    uptime: 99.7,
    active: true
  },
  {
    _id: 'srv-104',
    name: 'Kafka Event Streaming Bus',
    url: 'https://kafka.stacksentinel.internal/health',
    environment: 'Production',
    category: 'Infrastructure',
    expectedStatusCode: 200,
    status: 'UP',
    lastHttpStatus: 200,
    lastResponseTime: 19,
    lastChecked: new Date().toISOString(),
    uptime: 100.0,
    active: true
  }
];

const getDefaultDeployments = () => [
  {
    _id: 'dep-42',
    service: { name: 'Core Application Stack', environment: 'Production' },
    environment: 'Production',
    version: 'v1.42.0',
    status: 'SUCCESS',
    branch: 'main',
    commitHash: '22fae08',
    deployedBy: 'Jenkins CI/CD Agent',
    duration: 35,
    message: 'Automated build #42 verified via Jenkins Pipeline (17 integration tests passed)',
    createdAt: new Date(Date.now() - 180000).toISOString()
  },
  {
    _id: 'dep-41',
    service: { name: 'User Identity Service', environment: 'Production' },
    environment: 'Production',
    version: 'v1.41.2',
    status: 'SUCCESS',
    branch: 'main',
    commitHash: '16afc7a',
    deployedBy: 'Jenkins CI/CD Agent',
    duration: 41,
    message: 'Declarative pipeline automated rollout',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

const getDefaultUsers = () => [
  {
    id: 'u-admin-1',
    name: 'Site Administrator',
    email: 'admin@stacksentinel.io',
    role: 'ADMIN',
    servicesCount: 3,
    createdAt: new Date(Date.now() - 864000000).toISOString()
  },
  {
    id: 'u-dev-2',
    name: 'Lead DevOps Engineer',
    email: 'dev@stacksentinel.io',
    role: 'USER',
    servicesCount: 2,
    createdAt: new Date(Date.now() - 432000000).toISOString()
  },
  {
    id: 'u-dev-3',
    name: 'Platform Architect',
    email: 'arch@stacksentinel.io',
    role: 'USER',
    servicesCount: 1,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// Helper to access stored data
const getStored = (key, defaultFn) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const def = defaultFn();
      localStorage.setItem(key, JSON.stringify(def));
      return def;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultFn();
  }
};

const setStored = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
};

export const handleMockRequest = async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const url = (config.url || '').replace(/^\/api/, '').split('?')[0];
  const body = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};

  // Artificial low latency (30-80ms) for realistic response feel
  await new Promise((r) => setTimeout(r, 40));

  // 1. Auth routes
  if (url === '/auth/login' && method === 'post') {
    const isAdmin = body.email?.includes('admin');
    const user = {
      id: isAdmin ? 'demo-admin-id' : 'demo-user-id',
      name: isAdmin ? 'Site Administrator' : 'Lead DevOps Engineer',
      email: body.email || 'admin@stacksentinel.io',
      role: isAdmin ? 'ADMIN' : 'USER',
      createdAt: new Date().toISOString()
    };
    const token = `stacksentinel_demo_jwt_token_${user.role.toLowerCase()}_2026`;
    return { data: { success: true, message: 'Logged in successfully', data: { user, token } } };
  }

  if (url === '/auth/register' && method === 'post') {
    const user = {
      id: `u-${Date.now()}`,
      name: body.name || 'New Engineer',
      email: body.email || 'user@stacksentinel.io',
      role: body.role || 'USER',
      createdAt: new Date().toISOString()
    };
    const token = `stacksentinel_demo_jwt_token_${user.role.toLowerCase()}_2026`;
    return { data: { success: true, message: 'User registered successfully', data: { user, token } } };
  }

  if (url === '/auth/me' && method === 'get') {
    const storedUser = localStorage.getItem('stacksentinel_user');
    const user = storedUser ? JSON.parse(storedUser) : {
      id: 'demo-admin-id',
      name: 'Site Administrator',
      email: 'admin@stacksentinel.io',
      role: 'ADMIN'
    };
    return { data: { success: true, data: { user } } };
  }

  // 2. Services routes
  if (url === '/services' && method === 'get') {
    const services = getStored(MOCK_STORAGE_KEYS.SERVICES, getDefaultServices);
    return { data: { success: true, data: services } };
  }

  if (url === '/services' && method === 'post') {
    const services = getStored(MOCK_STORAGE_KEYS.SERVICES, getDefaultServices);
    const isChaosError = body.url?.includes('500') || body.url?.includes('fail');
    const latency = isChaosError ? 650 : Math.floor(Math.random() * 40) + 30;

    const newService = {
      _id: `srv-${Date.now()}`,
      name: body.name || 'New Monitored Endpoint',
      url: body.url || 'https://api.github.com',
      environment: body.environment || 'Production',
      category: body.category || 'API Gateway',
      expectedStatusCode: Number(body.expectedStatusCode) || 200,
      status: isChaosError ? 'DOWN' : 'UP',
      lastHttpStatus: isChaosError ? 500 : 200,
      lastResponseTime: latency,
      lastChecked: new Date().toISOString(),
      uptime: isChaosError ? 0.0 : 100.0,
      active: true
    };

    const updatedList = [newService, ...services];
    setStored(MOCK_STORAGE_KEYS.SERVICES, updatedList);
    return { data: { success: true, message: 'Service created and initial probe completed', data: newService } };
  }

  // Single service check probe
  const checkMatch = url.match(/^\/services\/([^/]+)\/check$/);
  if (checkMatch && method === 'post') {
    const id = checkMatch[1];
    const services = getStored(MOCK_STORAGE_KEYS.SERVICES, getDefaultServices);
    const target = services.find((s) => s._id === id);
    const latency = Math.floor(Math.random() * 45) + 25;
    const isDown = target?.url?.includes('500') || target?.url?.includes('fail');

    const updatedService = target
      ? {
          ...target,
          status: isDown ? 'DOWN' : 'UP',
          lastHttpStatus: isDown ? 500 : 200,
          lastResponseTime: latency,
          lastChecked: new Date().toISOString()
        }
      : { _id: id, status: 'UP', lastHttpStatus: 200, lastResponseTime: latency, lastChecked: new Date().toISOString() };

    const newList = services.map((s) => (s._id === id ? updatedService : s));
    setStored(MOCK_STORAGE_KEYS.SERVICES, newList);

    return {
      data: {
        success: true,
        message: 'Health probe completed',
        data: {
          service: updatedService,
          check: {
            status: updatedService.status,
            statusCode: updatedService.lastHttpStatus,
            responseTime: latency,
            timestamp: new Date().toISOString()
          }
        }
      }
    };
  }

  // Single service details with stats
  const serviceDetailMatch = url.match(/^\/services\/([^/]+)$/);
  if (serviceDetailMatch && method === 'get') {
    const id = serviceDetailMatch[1];
    const services = getStored(MOCK_STORAGE_KEYS.SERVICES, getDefaultServices);
    const service = services.find((s) => s._id === id) || services[0];
    const checks = Array.from({ length: 48 }, (_, i) => ({
      _id: `chk-${i}`,
      status: i === 3 ? 'DEGRADED' : 'UP',
      statusCode: 200,
      responseTime: Math.floor(Math.random() * 50) + 20,
      timestamp: new Date(Date.now() - (48 - i) * 1800000).toISOString()
    }));

    return {
      data: {
        success: true,
        data: {
          service,
          stats: {
            uptimePercentage: service.status === 'DOWN' ? 42.5 : 99.8,
            totalChecks: 1420,
            avgResponseTime: 42,
            minResponseTime: 18,
            maxResponseTime: 120,
            recentChecks: checks
          }
        }
      }
    };
  }

  // 3. Admin routes
  if (url === '/admin/stats' && method === 'get') {
    const services = getStored(MOCK_STORAGE_KEYS.SERVICES, getDefaultServices);
    const users = getStored(MOCK_STORAGE_KEYS.USERS, getDefaultUsers);
    const deps = getStored(MOCK_STORAGE_KEYS.DEPLOYMENTS, getDefaultDeployments);
    return {
      data: {
        success: true,
        data: {
          totalUsers: users.length,
          totalServices: services.length,
          totalHealthChecks: 1428,
          totalDeployments: deps.length,
          globalAvailability: 99.8,
          globalAvgResponseTime: 48
        }
      }
    };
  }

  if (url === '/admin/users' && method === 'get') {
    const users = getStored(MOCK_STORAGE_KEYS.USERS, getDefaultUsers);
    return { data: { success: true, data: users } };
  }

  const roleToggleMatch = url.match(/^\/admin\/users\/([^/]+)\/role$/);
  if (roleToggleMatch && method === 'put') {
    const id = roleToggleMatch[1];
    const users = getStored(MOCK_STORAGE_KEYS.USERS, getDefaultUsers);
    const newRole = body.role || 'ADMIN';
    const updated = users.map((u) => (u.id === id ? { ...u, role: newRole } : u));
    setStored(MOCK_STORAGE_KEYS.USERS, updated);
    return { data: { success: true, message: 'Role updated successfully', data: { id, role: newRole } } };
  }

  if (url === '/admin/activity' && method === 'get') {
    return {
      data: {
        success: true,
        data: [
          {
            id: 'act-1',
            type: 'HEALTH_CHECK',
            title: 'Automated Cluster SLA Probe',
            description: 'Global availability computed at 99.8%',
            status: 'UP',
            timestamp: new Date().toISOString()
          },
          {
            id: 'act-2',
            type: 'DEPLOYMENT',
            title: 'Jenkins Webhook Telemetry',
            description: 'Release build #42 completed successfully in 35s',
            status: 'SUCCESS',
            timestamp: new Date(Date.now() - 120000).toISOString()
          }
        ]
      }
    };
  }

  // 4. Deployments routes
  if (url === '/deployments' && method === 'get') {
    const deps = getStored(MOCK_STORAGE_KEYS.DEPLOYMENTS, getDefaultDeployments);
    return { data: { success: true, data: deps } };
  }

  if ((url === '/deployments/jenkins' || url === '/deployments') && method === 'post') {
    const deps = getStored(MOCK_STORAGE_KEYS.DEPLOYMENTS, getDefaultDeployments);
    const newDep = {
      _id: `dep-${Date.now()}`,
      service: { name: body.serviceName || 'Core Application Stack', environment: body.environment || 'Production' },
      environment: body.environment || 'Production',
      version: body.version || `v1.${deps.length + 42}.0`,
      status: body.status || 'SUCCESS',
      branch: body.branch || 'main',
      commitHash: body.commitHash || 'b389018',
      deployedBy: url.includes('jenkins') ? 'Jenkins CI/CD Agent' : 'Site Administrator',
      duration: Number(body.duration) || 32,
      message: body.message || 'Automated build verified via Jenkins Pipeline (17 integration tests passed)',
      createdAt: new Date().toISOString()
    };
    const updated = [newDep, ...deps];
    setStored(MOCK_STORAGE_KEYS.DEPLOYMENTS, updated);
    return { data: { success: true, message: 'Deployment record saved', data: newDep } };
  }

  // Fallback generic 200
  return { data: { success: true, message: 'Success' } };
};
