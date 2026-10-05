const mongoose = require('mongoose');
const { successResponse } = require('../utils/response');

/**
 * @desc    Get overall system/platform health status
 * @route   GET /api/health
 * @access  Public
 */
const getPlatformHealth = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  const healthData = {
    status: dbState === 1 ? 'UP' : 'DEGRADED',
    platform: 'StackSentinel Monitoring Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    database: {
      status: dbStatusMap[dbState] || 'Unknown',
      connected: dbState === 1
    },
    memoryUsage: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    }
  };

  return successResponse(res, 200, 'Platform is operational', healthData);
};

module.exports = {
  getPlatformHealth
};
