const mongoose = require('mongoose');

const healthCheckSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['UP', 'DOWN', 'DEGRADED', 'UNKNOWN'],
      required: true
    },
    httpStatus: {
      type: Number,
      default: null
    },
    responseTime: {
      type: Number,
      default: null
    },
    error: {
      type: String,
      default: null
    },
    checkedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

healthCheckSchema.index({ service: 1, checkedAt: -1 });

module.exports = mongoose.model('HealthCheck', healthCheckSchema);
