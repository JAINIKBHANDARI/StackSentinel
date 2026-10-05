const Service = require('../models/Service');
const HealthCheck = require('../models/HealthCheck');
const Deployment = require('../models/Deployment');
const { performHealthCheck } = require('../services/healthCheckService');
const { calculateServiceAvailability } = require('../services/availabilityService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get all registered services
 * @route   GET /api/services
 * @access  Private
 */
const getServices = async (req, res, next) => {
  try {
    const query = req.user.role === 'ADMIN' ? {} : { user: req.user._id };

    // Support optional filters by environment or status or category
    if (req.query.environment) query.environment = req.query.environment;
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;

    const services = await Service.find(query)
      .populate('user', 'name email')
      .sort({ updatedAt: -1 });

    return successResponse(res, 200, 'Services retrieved successfully', services);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single service with computed stats
 * @route   GET /api/services/:id
 * @access  Private
 */
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('user', 'name email');
    if (!service) {
      return errorResponse(res, 404, 'Service not found');
    }

    // Authorization check
    if (req.user.role !== 'ADMIN' && service.user._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to view this service');
    }

    // Compute availability and stats from actual health checks
    const stats = await calculateServiceAvailability(service._id, 100);

    return successResponse(res, 200, 'Service details retrieved', {
      service,
      stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new service
 * @route   POST /api/services
 * @access  Private
 */
const createService = async (req, res, next) => {
  try {
    const {
      name,
      description,
      url,
      environment,
      category,
      expectedStatusCode,
      active
    } = req.body;

    if (!name || !url) {
      return errorResponse(res, 400, 'Service name and endpoint URL are required');
    }

    const service = await Service.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      url: url.trim(),
      environment: environment || 'Production',
      category: category || 'API',
      expectedStatusCode: expectedStatusCode ? Number(expectedStatusCode) : 200,
      active: active !== undefined ? Boolean(active) : true,
      user: req.user._id,
      status: 'UNKNOWN'
    });

    // Automatically perform an initial health check asynchronously or synchronously
    try {
      await performHealthCheck(service);
    } catch (checkErr) {
      console.warn(`[HealthCheck Warning] Initial check for ${service.name} failed:`, checkErr.message);
    }

    const freshService = await Service.findById(service._id);

    return successResponse(res, 201, 'Service created successfully', freshService);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing service
 * @route   PUT /api/services/:id
 * @access  Private
 */
const updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) {
      return errorResponse(res, 404, 'Service not found');
    }

    if (req.user.role !== 'ADMIN' && service.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to modify this service');
    }

    const {
      name,
      description,
      url,
      environment,
      category,
      expectedStatusCode,
      active
    } = req.body;

    if (name !== undefined) service.name = name.trim();
    if (description !== undefined) service.description = description.trim();
    if (url !== undefined) service.url = url.trim();
    if (environment !== undefined) service.environment = environment;
    if (category !== undefined) service.category = category;
    if (expectedStatusCode !== undefined) service.expectedStatusCode = Number(expectedStatusCode);
    if (active !== undefined) service.active = Boolean(active);

    await service.save();

    return successResponse(res, 200, 'Service updated successfully', service);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a service and cascade health checks / deployments
 * @route   DELETE /api/services/:id
 * @access  Private
 */
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return errorResponse(res, 404, 'Service not found');
    }

    if (req.user.role !== 'ADMIN' && service.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to delete this service');
    }

    await HealthCheck.deleteMany({ service: service._id });
    await Deployment.deleteMany({ service: service._id });
    await service.deleteOne();

    return successResponse(res, 200, 'Service and associated monitoring data deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger manual health check on demand
 * @route   POST /api/services/:id/check
 * @access  Private
 */
const triggerServiceCheck = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return errorResponse(res, 404, 'Service not found');
    }

    if (req.user.role !== 'ADMIN' && service.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to check this service');
    }

    const { healthCheck, service: updatedService } = await performHealthCheck(service);

    return successResponse(res, 200, `Health check completed: ${updatedService.status}`, {
      healthCheck,
      service: updatedService
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get service health check history
 * @route   GET /api/services/:id/health-history
 * @access  Private
 */
const getServiceHealthHistory = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return errorResponse(res, 404, 'Service not found');
    }

    if (req.user.role !== 'ADMIN' && service.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to view health history');
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const checks = await HealthCheck.find({ service: service._id })
      .sort({ checkedAt: -1 })
      .limit(limit);

    return successResponse(res, 200, 'Health check history retrieved', checks);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  triggerServiceCheck,
  getServiceHealthHistory
};
