const Deployment = require('../models/Deployment');
const Service = require('../models/Service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get all deployment records
 * @route   GET /api/deployments
 * @access  Private
 */
const getDeployments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.serviceId) filter.service = req.query.serviceId;
    if (req.query.environment) filter.environment = req.query.environment;
    if (req.query.status) filter.status = req.query.status;

    // Regular users see deployments for their services, Admins see all
    if (req.user.role !== 'ADMIN') {
      const userServices = await Service.find({ user: req.user._id }).select('_id');
      const userIds = userServices.map(s => s._id);
      filter.service = { $in: userIds };
    }

    const deployments = await Deployment.find(filter)
      .populate('service', 'name environment category url')
      .sort({ createdAt: -1 })
      .limit(50);

    return successResponse(res, 200, 'Deployments retrieved successfully', deployments);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single deployment by ID
 * @route   GET /api/deployments/:id
 * @access  Private
 */
const getDeploymentById = async (req, res, next) => {
  try {
    const deployment = await Deployment.findById(req.params.id)
      .populate('service', 'name environment category url user');

    if (!deployment) {
      return errorResponse(res, 404, 'Deployment record not found');
    }

    if (
      req.user.role !== 'ADMIN' &&
      deployment.service.user.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 403, 'Not authorized to view this deployment');
    }

    return successResponse(res, 200, 'Deployment record retrieved', deployment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record/trigger a deployment simulation (CI/CD readiness endpoint)
 * @route   POST /api/deployments
 * @access  Private
 */
const createDeployment = async (req, res, next) => {
  try {
    const {
      serviceId,
      version,
      branch,
      commitHash,
      environment,
      status,
      message
    } = req.body;

    if (!serviceId || !version) {
      return errorResponse(res, 400, 'serviceId and version are required');
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return errorResponse(res, 404, 'Target service not found');
    }

    if (req.user.role !== 'ADMIN' && service.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to deploy this service');
    }

    const deployment = await Deployment.create({
      service: service._id,
      version: version.trim(),
      branch: branch || 'main',
      commitHash: commitHash || Math.random().toString(16).substring(2, 9),
      environment: environment || service.environment,
      status: status || 'SUCCESS',
      triggeredBy: req.user.name || 'User',
      startedAt: new Date(),
      completedAt: new Date(),
      duration: Math.floor(Math.random() * 45) + 15, // simulated 15-60s
      message: message || `Deployed release ${version} to ${environment || service.environment}`
    });

    const populated = await Deployment.findById(deployment._id).populate('service', 'name environment category');

    return successResponse(res, 201, 'Deployment recorded successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update deployment status
 * @route   PUT /api/deployments/:id/status
 * @access  Private
 */
const updateDeploymentStatus = async (req, res, next) => {
  try {
    const { status, message, duration } = req.body;
    const deployment = await Deployment.findById(req.params.id);

    if (!deployment) {
      return errorResponse(res, 404, 'Deployment record not found');
    }

    if (status) deployment.status = status;
    if (message) deployment.message = message;
    if (duration) deployment.duration = duration;

    if (['SUCCESS', 'FAILED', 'CANCELLED'].includes(status)) {
      deployment.completedAt = new Date();
    }

    await deployment.save();

    return successResponse(res, 200, 'Deployment status updated', deployment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record CI/CD deployment from Jenkins pipeline webhook
 * @route   POST /api/deployments/jenkins
 * @access  Public (Protected via x-jenkins-token)
 */
const recordJenkinsDeployment = async (req, res, next) => {
  try {
    const jenkinsToken = req.headers['x-jenkins-token'] || req.query.token;
    const expectedToken = process.env.JENKINS_WEBHOOK_SECRET || 'stacksentinel_jenkins_secret_2026';

    if (!jenkinsToken || jenkinsToken !== expectedToken) {
      return errorResponse(res, 401, 'Unauthorized: Invalid or missing Jenkins webhook token (x-jenkins-token)');
    }

    const {
      serviceName,
      serviceId,
      buildNumber,
      version,
      branch,
      commitHash,
      environment,
      status,
      duration,
      message,
      buildUrl
    } = req.body;

    // Find target service
    let targetService = null;
    if (serviceId) {
      targetService = await Service.findById(serviceId);
    } else if (serviceName) {
      targetService = await Service.findOne({ name: new RegExp(serviceName, 'i') });
    }

    if (!targetService) {
      targetService = await Service.findOne({});
    }

    if (!targetService) {
      targetService = await Service.create({
        name: 'StackSentinel Production Stack',
        description: 'Primary production workload monitored by Jenkins CI/CD',
        url: 'https://stack-sentinel-blush.vercel.app',
        environment: environment || 'Production',
        category: 'Backend',
        expectedStatusCode: 200,
        status: status === 'SUCCESS' ? 'UP' : status === 'FAILED' ? 'DOWN' : 'UNKNOWN'
      });
    }

    const buildStatus = ['SUCCESS', 'FAILED', 'RUNNING', 'QUEUED', 'CANCELLED'].includes((status || '').toUpperCase())
      ? status.toUpperCase()
      : 'SUCCESS';

    const releaseVersion = version || (buildNumber ? `v1.${buildNumber}.0` : `v1.0.${Date.now().toString().slice(-4)}`);

    const deployment = await Deployment.create({
      service: targetService._id,
      version: releaseVersion,
      branch: branch || 'main',
      commitHash: commitHash || (process.env.GIT_COMMIT ? process.env.GIT_COMMIT.substring(0, 7) : 'jenkins-build'),
      environment: environment || targetService.environment || 'Production',
      status: buildStatus,
      triggeredBy: buildUrl ? `Jenkins Build #${buildNumber || '1'}` : `Jenkins CI/CD Pipeline`,
      startedAt: new Date(Date.now() - (duration ? duration * 1000 : 30000)),
      completedAt: ['SUCCESS', 'FAILED', 'CANCELLED'].includes(buildStatus) ? new Date() : null,
      duration: duration || Math.floor(Math.random() * 25) + 15,
      message: message || `Jenkins CI/CD Build #${buildNumber || '1'} executed successfully on branch ${branch || 'main'}`
    });

    const populated = await Deployment.findById(deployment._id).populate('service', 'name environment category');

    return successResponse(res, 201, 'Jenkins deployment telemetry recorded successfully', populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeployments,
  getDeploymentById,
  createDeployment,
  updateDeploymentStatus,
  recordJenkinsDeployment
};

