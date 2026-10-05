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

module.exports = {
  getDeployments,
  getDeploymentById,
  createDeployment,
  updateDeploymentStatus
};
