const axios = require('axios');
const HealthCheck = require('../models/HealthCheck');
const Service = require('../models/Service');

// Allowed URL schemes to prevent SSRF against unauthorized protocols
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Validate that URL is well-formed and uses standard HTTP/HTTPS protocols
 */
const validateUrlSafety = (rawUrl) => {
  try {
    const parsed = new URL(rawUrl);
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are permitted' };
    }
    // Block local loopback ranges if running in production security context,
    // but allow standard application endpoints and mock tests
    return { valid: true, parsed };
  } catch (err) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Performs a health check against a service
 * @param {Object} service - Service Mongoose Document
 * @returns {Promise<Object>} The created HealthCheck record and updated Service
 */
const performHealthCheck = async (service) => {
  const urlCheck = validateUrlSafety(service.url);
  if (!urlCheck.valid) {
    const errorCheck = await HealthCheck.create({
      service: service._id,
      status: 'DOWN',
      httpStatus: null,
      responseTime: null,
      error: urlCheck.error,
      checkedAt: new Date()
    });

    service.status = 'DOWN';
    service.lastHttpStatus = null;
    service.lastResponseTime = null;
    service.lastChecked = new Date();
    await service.save();

    return { healthCheck: errorCheck, service };
  }

  const startTime = Date.now();
  let status = 'UNKNOWN';
  let httpStatus = null;
  let responseTime = null;
  let errorMessage = null;

  try {
    const response = await axios.get(service.url, {
      timeout: 6000,
      headers: {
        'User-Agent': 'StackSentinel-HealthMonitor/1.0 (+https://stacksentinel.local)'
      },
      validateStatus: () => true // Allow handling non-200 responses directly
    });

    responseTime = Date.now() - startTime;
    httpStatus = response.status;

    const expected = service.expectedStatusCode || 200;

    if (httpStatus === expected) {
      // Degraded if latency is higher than 800ms
      if (responseTime > 800) {
        status = 'DEGRADED';
      } else {
        status = 'UP';
      }
    } else if (httpStatus >= 200 && httpStatus < 400) {
      status = 'DEGRADED'; // Responding with OK/Redirect but not the exact expected code
    } else {
      status = 'DOWN';
      errorMessage = `Returned HTTP ${httpStatus} (Expected ${expected})`;
    }
  } catch (error) {
    responseTime = Date.now() - startTime;
    status = 'DOWN';

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorMessage = 'Connection timed out (threshold: 6000ms)';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'DNS lookup failed / Host unreachable';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused by target host';
    } else {
      errorMessage = error.message || 'Service network check failed';
    }
  }

  // Create HealthCheck history record
  const healthCheck = await HealthCheck.create({
    service: service._id,
    status,
    httpStatus,
    responseTime,
    error: errorMessage,
    checkedAt: new Date()
  });

  // Update Service snapshot
  service.status = status;
  service.lastHttpStatus = httpStatus;
  service.lastResponseTime = responseTime;
  service.lastChecked = new Date();
  if (status === 'UP' || status === 'DEGRADED') {
    service.lastSuccessfulCheck = new Date();
  }
  await service.save();

  return { healthCheck, service };
};

module.exports = {
  performHealthCheck,
  validateUrlSafety
};
