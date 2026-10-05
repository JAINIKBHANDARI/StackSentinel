require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const HealthCheck = require('../models/HealthCheck');
const Deployment = require('../models/Deployment');
const { performHealthCheck } = require('../services/healthCheckService');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stacksentinel';
    console.log(`[Seed] Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Service.deleteMany({}),
      HealthCheck.deleteMany({}),
      Deployment.deleteMany({})
    ]);

    console.log('[Seed] Creating demo accounts...');
    const adminUser = await User.create({
      name: 'Sentinel Admin',
      email: 'admin@stacksentinel.io',
      password: 'Admin@Password123',
      role: 'ADMIN'
    });

    const demoUser = await User.create({
      name: 'Alex Developer',
      email: 'dev@stacksentinel.io',
      password: 'Dev@Password123',
      role: 'USER'
    });

    console.log(` Created Admin: ${adminUser.email}`);
    console.log(` Created User: ${demoUser.email}`);

    console.log('[Seed] Registering core stack services...');
    const servicesToCreate = [
      {
        name: 'StackSentinel Frontend',
        description: 'Vite React production dashboard and web client interface',
        url: 'https://httpbin.org/status/200',
        environment: 'Production',
        category: 'Frontend',
        expectedStatusCode: 200,
        active: true,
        user: adminUser._id
      },
      {
        name: 'API Gateway',
        description: 'Central edge ingress routing, rate limiting, and reverse proxy',
        url: 'https://httpbin.org/get',
        environment: 'Production',
        category: 'API',
        expectedStatusCode: 200,
        active: true,
        user: adminUser._id
      },
      {
        name: 'Authentication Service',
        description: 'OAuth2 session validation, RBAC policies, and JWT token lifecycle',
        url: 'https://httpbin.org/status/200',
        environment: 'Production',
        category: 'Backend',
        expectedStatusCode: 200,
        active: true,
        user: adminUser._id
      },
      {
        name: 'Payment Service',
        description: 'Stripe checkout webhooks, transaction reconciliation, and ledger',
        url: 'https://httpbin.org/delay/1', // Will simulate degraded/higher latency (>800ms)
        environment: 'Staging',
        category: 'Backend',
        expectedStatusCode: 200,
        active: true,
        user: demoUser._id
      },
      {
        name: 'Notification Service',
        description: 'Multi-channel alerting engine (Email, Slack, Webhook, SMS)',
        url: 'https://httpbin.org/status/200',
        environment: 'Development',
        category: 'Backend',
        expectedStatusCode: 200,
        active: true,
        user: demoUser._id
      },
      {
        name: 'Database Cluster Monitor',
        description: 'MongoDB Atlas primary replica set heartbeat probe',
        url: 'https://httpbin.org/status/200',
        environment: 'Production',
        category: 'Database',
        expectedStatusCode: 200,
        active: true,
        user: adminUser._id
      }
    ];

    const createdServices = [];
    for (const sData of servicesToCreate) {
      const s = await Service.create(sData);
      createdServices.push(s);
    }

    console.log(` Created ${createdServices.length} services.`);

    console.log('[Seed] Generating initial health checks...');
    for (const service of createdServices) {
      // Create a few historical health checks for charts & availability calculations
      const now = Date.now();
      const pastChecks = [
        { offsetMin: 60, status: 'UP', resp: 120 + Math.floor(Math.random() * 80) },
        { offsetMin: 45, status: 'UP', resp: 135 + Math.floor(Math.random() * 90) },
        { offsetMin: 30, status: service.name.includes('Payment') ? 'DEGRADED' : 'UP', resp: service.name.includes('Payment') ? 1100 : 140 },
        { offsetMin: 15, status: 'UP', resp: 150 + Math.floor(Math.random() * 60) },
        { offsetMin: 2, status: service.name.includes('Payment') ? 'DEGRADED' : 'UP', resp: service.name.includes('Payment') ? 1050 : 110 }
      ];

      for (const item of pastChecks) {
        await HealthCheck.create({
          service: service._id,
          status: item.status,
          httpStatus: 200,
          responseTime: item.resp,
          error: item.status === 'DEGRADED' ? 'Response latency > 800ms threshold' : null,
          checkedAt: new Date(now - item.offsetMin * 60 * 1000)
        });
      }

      // Update service status
      service.status = service.name.includes('Payment') ? 'DEGRADED' : 'UP';
      service.lastHttpStatus = 200;
      service.lastResponseTime = service.name.includes('Payment') ? 1050 : 125;
      service.lastChecked = new Date();
      service.lastSuccessfulCheck = new Date();
      await service.save();
    }

    console.log('[Seed] Generating sample CI/CD deployment history...');
    const deploymentSamples = [
      {
        service: createdServices[0]._id,
        version: 'v1.4.2',
        branch: 'main',
        commitHash: 'a9f3b21',
        environment: 'Production',
        status: 'SUCCESS',
        triggeredBy: 'Alex Developer',
        startedAt: new Date(Date.now() - 3600 * 1000 * 4),
        completedAt: new Date(Date.now() - 3600 * 1000 * 4 + 48000),
        duration: 48,
        message: 'Refactor navbar navigation and health indicator status pill'
      },
      {
        service: createdServices[1]._id,
        version: 'v2.1.0',
        branch: 'release/2.1',
        commitHash: 'e71c904',
        environment: 'Production',
        status: 'SUCCESS',
        triggeredBy: 'Sentinel Admin',
        startedAt: new Date(Date.now() - 3600 * 1000 * 12),
        completedAt: new Date(Date.now() - 3600 * 1000 * 12 + 62000),
        duration: 62,
        message: 'Implement rate limiting algorithms and CORS whitelisting'
      },
      {
        service: createdServices[3]._id,
        version: 'v1.0.8',
        branch: 'hotfix/retry-queue',
        commitHash: 'b441f7d',
        environment: 'Staging',
        status: 'SUCCESS',
        triggeredBy: 'Alex Developer',
        startedAt: new Date(Date.now() - 3600 * 1000 * 2),
        completedAt: new Date(Date.now() - 3600 * 1000 * 2 + 35000),
        duration: 35,
        message: 'Handle idempotency tokens for Stripe charge retries'
      },
      {
        service: createdServices[4]._id,
        version: 'v0.9.4',
        branch: 'feature/slack-alerts',
        commitHash: 'd2209ea',
        environment: 'Development',
        status: 'RUNNING',
        triggeredBy: 'Alex Developer',
        startedAt: new Date(Date.now() - 600 * 1000),
        completedAt: null,
        duration: 25,
        message: 'Automate webhook payloads to Discord and Slack incident channels'
      },
      {
        service: createdServices[2]._id,
        version: 'v1.3.1',
        branch: 'fix/token-expiry',
        commitHash: 'c8812af',
        environment: 'Production',
        status: 'SUCCESS',
        triggeredBy: 'Sentinel Admin',
        startedAt: new Date(Date.now() - 3600 * 1000 * 24),
        completedAt: new Date(Date.now() - 3600 * 1000 * 24 + 54000),
        duration: 54,
        message: 'Correct refresh token rotation expiry duration'
      }
    ];

    for (const dep of deploymentSamples) {
      await Deployment.create(dep);
    }

    console.log('[Seed] Database seeding completed successfully!');
    console.log('--------------------------------------------------');
    console.log('DEMO ACCOUNTS:');
    console.log(' Admin User: email="admin@stacksentinel.io" password="Admin@Password123"');
    console.log(' Standard User: email="dev@stacksentinel.io" password="Dev@Password123"');
    console.log('--------------------------------------------------');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
