const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Service = require('../models/Service');
const HealthCheck = require('../models/HealthCheck');

const TEST_DB_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/stacksentinel_test';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await mongoose.connect(TEST_DB_URI);
  await User.deleteMany({});
  await Service.deleteMany({});
  await HealthCheck.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await Service.deleteMany({});
  await HealthCheck.deleteMany({});
  await mongoose.connection.close();
});

describe('StackSentinel Core API Test Suite', () => {
  let authToken = '';
  let adminToken = '';
  let testUserId = '';
  let createdServiceId = '';

  describe('1. Health Endpoint', () => {
    it('GET /api/health - should return 200 and platform status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.platform).toContain('StackSentinel');
      expect(res.body.data.database.connected).toBe(true);
    });
  });

  describe('2. Authentication Flow', () => {
    it('POST /api/auth/register - should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Engineer',
          email: 'testengineer@stacksentinel.io',
          password: 'TestPassword123!',
          role: 'USER'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('testengineer@stacksentinel.io');
      expect(res.body.data.user.role).toBe('USER');

      authToken = res.body.data.token;
      testUserId = res.body.data.user.id;
    });

    it('POST /api/auth/register - duplicate registration fails with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Engineer',
          email: 'testengineer@stacksentinel.io',
          password: 'AnotherPassword123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('POST /api/auth/login - should authenticate user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testengineer@stacksentinel.io',
          password: 'TestPassword123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/login - should reject invalid credentials with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testengineer@stacksentinel.io',
          password: 'WrongPassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me - should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(testUserId);
    });
  });

  describe('3. Services & Monitoring Flow', () => {
    it('POST /api/services - unauthenticated service creation is rejected with 401', async () => {
      const res = await request(app)
        .post('/api/services')
        .send({
          name: 'Unauthorized Service',
          url: 'https://httpbin.org/status/200'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/services - authenticated user creates service successfully', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Payment Gateway Probe',
          description: 'Payment microservice health check',
          url: 'https://httpbin.org/status/200',
          environment: 'Production',
          category: 'API',
          expectedStatusCode: 200
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Payment Gateway Probe');
      expect(res.body.data.environment).toBe('Production');
      expect(res.body.data._id).toBeDefined();

      createdServiceId = res.body.data._id;
    });

    it('GET /api/services - returns registered services for user', async () => {
      const res = await request(app)
        .get('/api/services')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/services/:id/check - triggers manual health check', async () => {
      const res = await request(app)
        .post(`/api/services/${createdServiceId}/check`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.healthCheck).toBeDefined();
      expect(['UP', 'DEGRADED', 'DOWN']).toContain(res.body.data.service.status);
    });

    it('GET /api/services/:id - returns service details and availability stats', async () => {
      const res = await request(app)
        .get(`/api/services/${createdServiceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.service._id).toBe(createdServiceId);
      expect(res.body.data.stats).toBeDefined();
      expect(res.body.data.stats.totalChecks).toBeGreaterThanOrEqual(1);
    });
  });

  describe('4. Role-based Admin Authorization', () => {
    it('GET /api/admin/stats - regular user is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Admin privileges required');
    });

    it('GET /api/admin/stats - admin user accesses stats successfully', async () => {
      // Register an admin user
      const adminRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Super Admin',
          email: 'admin_test@stacksentinel.io',
          password: 'AdminPassword123!',
          role: 'ADMIN'
        });

      adminToken = adminRes.body.data.token;

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(2);
      expect(res.body.data.totalServices).toBeGreaterThanOrEqual(1);
    });
  });

  describe('5. CI/CD Deployments & Jenkins Webhook Integration', () => {
    it('POST /api/deployments/jenkins - fails without webhook token (401)', async () => {
      const res = await request(app)
        .post('/api/deployments/jenkins')
        .send({
          buildNumber: '1',
          version: 'v1.0.0',
          branch: 'main'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid or missing Jenkins webhook token');
    });

    it('POST /api/deployments/jenkins - fails with incorrect webhook token (401)', async () => {
      const res = await request(app)
        .post('/api/deployments/jenkins')
        .set('x-jenkins-token', 'wrong_secret_token')
        .send({
          buildNumber: '1',
          version: 'v1.0.0',
          branch: 'main'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/deployments/jenkins - succeeds with valid x-jenkins-token (201)', async () => {
      const res = await request(app)
        .post('/api/deployments/jenkins')
        .set('x-jenkins-token', process.env.JENKINS_WEBHOOK_SECRET || 'stacksentinel_jenkins_secret_2026')
        .send({
          buildNumber: '42',
          version: 'v1.42.0',
          branch: 'main',
          commitHash: 'a1b2c3d',
          status: 'SUCCESS',
          environment: 'Production',
          duration: 38,
          message: 'Automated build #42 verified via Jenkins CI/CD'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.version).toBe('v1.42.0');
      expect(res.body.data.status).toBe('SUCCESS');
      expect(res.body.data.triggeredBy).toContain('Jenkins');
    });

    it('GET /api/deployments - authenticated user retrieves deployments list', async () => {
      const res = await request(app)
        .get('/api/deployments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});

