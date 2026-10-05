const User = require('../models/User');
const Service = require('../models/Service');
const HealthCheck = require('../models/HealthCheck');
const Deployment = require('../models/Deployment');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get system-wide metrics and stats for Admin dashboard
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalServices,
      totalDeployments,
      totalHealthChecks,
      statusBreakdown,
      envBreakdown
    ] = await Promise.all([
      User.countDocuments(),
      Service.countDocuments(),
      Deployment.countDocuments(),
      HealthCheck.countDocuments(),
      Service.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Service.aggregate([
        { $group: { _id: '$environment', count: { $sum: 1 } } }
      ])
    ]);

    // Format status breakdown
    const statusCounts = {
      UP: 0,
      DOWN: 0,
      DEGRADED: 0,
      UNKNOWN: 0
    };
    statusBreakdown.forEach(item => {
      if (item._id && statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
      }
    });

    // Format environment breakdown
    const envCounts = {
      Development: 0,
      Staging: 0,
      Production: 0
    };
    envBreakdown.forEach(item => {
      if (item._id && envCounts[item._id] !== undefined) {
        envCounts[item._id] = item.count;
      }
    });

    // Compute global average response time and availability from last 200 checks
    const recentChecks = await HealthCheck.find().sort({ checkedAt: -1 }).limit(200).lean();
    let totalRespTime = 0;
    let respTimeCount = 0;
    let successfulChecks = 0;

    recentChecks.forEach(check => {
      if (check.status === 'UP' || check.status === 'DEGRADED') {
        successfulChecks++;
      }
      if (typeof check.responseTime === 'number' && check.responseTime > 0) {
        totalRespTime += check.responseTime;
        respTimeCount++;
      }
    });

    const globalAvailability = recentChecks.length > 0
      ? Number(((successfulChecks / recentChecks.length) * 100).toFixed(1))
      : 100.0;

    const globalAvgResponseTime = respTimeCount > 0
      ? Math.round(totalRespTime / respTimeCount)
      : 0;

    return successResponse(res, 200, 'Admin system metrics retrieved', {
      totalUsers,
      totalServices,
      totalDeployments,
      totalHealthChecks,
      statusCounts,
      envCounts,
      globalAvailability,
      globalAvgResponseTime
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users list
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Fetch service count per user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const servicesCount = await Service.countDocuments({ user: u._id });
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          servicesCount
        };
      })
    );

    return successResponse(res, 200, 'Users retrieved successfully', usersWithStats);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role)) {
      return errorResponse(res, 400, 'Role must be either USER or ADMIN');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Prevent removing admin role from oneself
    if (user._id.toString() === req.user._id.toString() && role !== 'ADMIN') {
      return errorResponse(res, 400, 'Cannot revoke your own administrator role');
    }

    user.role = role;
    await user.save();

    return successResponse(res, 200, `User role updated to ${role}`, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unified recent activity feed
 * @route   GET /api/admin/activity
 * @access  Private
 */
const getActivityFeed = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const [recentChecks, recentDeployments, recentServices] = await Promise.all([
      HealthCheck.find()
        .populate('service', 'name environment')
        .sort({ checkedAt: -1 })
        .limit(limit)
        .lean(),
      Deployment.find()
        .populate('service', 'name environment')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Service.find()
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    ]);

    const activities = [];

    recentChecks.forEach(hc => {
      if (hc.service) {
        activities.push({
          id: `check-${hc._id}`,
          type: 'HEALTH_CHECK',
          title: `Health Check: ${hc.service.name}`,
          description: `Result: ${hc.status} (${hc.httpStatus || 'N/A'}) - ${hc.responseTime || 0}ms`,
          status: hc.status,
          timestamp: hc.checkedAt,
          serviceName: hc.service.name
        });
      }
    });

    recentDeployments.forEach(dep => {
      if (dep.service) {
        activities.push({
          id: `dep-${dep._id}`,
          type: 'DEPLOYMENT',
          title: `Deployment: ${dep.service.name} (${dep.version})`,
          description: `${dep.status} in ${dep.environment} - ${dep.message || 'Triggered'}`,
          status: dep.status,
          timestamp: dep.createdAt,
          serviceName: dep.service.name
        });
      }
    });

    recentServices.forEach(srv => {
      activities.push({
        id: `srv-${srv._id}`,
        type: 'SERVICE_REGISTERED',
        title: `Service Registered: ${srv.name}`,
        description: `Created for ${srv.environment} (${srv.category}) by ${srv.user?.name || 'User'}`,
        status: srv.status,
        timestamp: srv.createdAt,
        serviceName: srv.name
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return successResponse(res, 200, 'Recent activities retrieved', activities.slice(0, limit));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getActivityFeed
};
