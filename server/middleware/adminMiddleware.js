const { errorResponse } = require('../utils/response');

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  return errorResponse(res, 403, 'Forbidden: Admin privileges required to access this resource');
};

module.exports = { requireAdmin };
