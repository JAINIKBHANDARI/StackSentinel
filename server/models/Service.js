const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a service name'],
      trim: true,
      maxlength: [100, 'Service name cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    url: {
      type: String,
      required: [true, 'Please provide a service endpoint URL'],
      trim: true
    },
    environment: {
      type: String,
      enum: ['Development', 'Staging', 'Production'],
      default: 'Production'
    },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'API', 'Database', 'Third-party'],
      default: 'API'
    },
    expectedStatusCode: {
      type: Number,
      default: 200
    },
    active: {
      type: Boolean,
      default: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['UP', 'DOWN', 'DEGRADED', 'UNKNOWN'],
      default: 'UNKNOWN'
    },
    lastHttpStatus: {
      type: Number,
      default: null
    },
    lastResponseTime: {
      type: Number,
      default: null
    },
    lastChecked: {
      type: Date,
      default: null
    },
    lastSuccessfulCheck: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

serviceSchema.index({ user: 1, environment: 1 });
serviceSchema.index({ status: 1 });

module.exports = mongoose.model('Service', serviceSchema);
