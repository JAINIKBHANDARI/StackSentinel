const HealthCheck = require('../models/HealthCheck');

/**
 * Calculate service availability and performance stats based on actual DB health checks
 * @param {string|ObjectId} serviceId
 * @param {number} limit - Maximum number of recent checks to analyze (default 100)
 */
const calculateServiceAvailability = async (serviceId, limit = 100) => {
  const checks = await HealthCheck.find({ service: serviceId })
    .sort({ checkedAt: -1 })
    .limit(limit)
    .lean();

  const totalChecks = checks.length;
  if (totalChecks === 0) {
    return {
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      availabilityPercentage: 100.0,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      recentHistory: []
    };
  }

  let successfulChecks = 0;
  let failedChecks = 0;
  let totalResponseTime = 0;
  let responseTimeCount = 0;
  let minResponseTime = Infinity;
  let maxResponseTime = 0;

  checks.forEach(check => {
    if (check.status === 'UP' || check.status === 'DEGRADED') {
      successfulChecks++;
    } else {
      failedChecks++;
    }

    if (typeof check.responseTime === 'number' && check.responseTime > 0) {
      totalResponseTime += check.responseTime;
      responseTimeCount++;
      if (check.responseTime < minResponseTime) minResponseTime = check.responseTime;
      if (check.responseTime > maxResponseTime) maxResponseTime = check.responseTime;
    }
  });

  const availabilityPercentage = Number(
    ((successfulChecks / totalChecks) * 100).toFixed(1)
  );

  const averageResponseTime = responseTimeCount > 0
    ? Math.round(totalResponseTime / responseTimeCount)
    : 0;

  return {
    totalChecks,
    successfulChecks,
    failedChecks,
    availabilityPercentage,
    averageResponseTime,
    minResponseTime: minResponseTime === Infinity ? 0 : minResponseTime,
    maxResponseTime,
    recentHistory: checks.slice(0, 30)
  };
};

module.exports = {
  calculateServiceAvailability
};
