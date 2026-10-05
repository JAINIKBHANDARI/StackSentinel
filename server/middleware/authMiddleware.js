const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'stacksentinel_jwt_secret_dev_key_2026');

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return errorResponse(res, 401, 'User account no longer exists');
      }

      req.user = user;
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Session has expired, please log in again');
      }
      return errorResponse(res, 401, 'Not authorized, invalid token');
    }
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized, no bearer token provided');
  }
};

module.exports = { protect };
