const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true
    },
    version: {
      type: String,
      required: [true, 'Please provide a release/deployment version'],
      trim: true
    },
    branch: {
      type: String,
      default: 'main',
      trim: true
    },
    commitHash: {
      type: String,
      trim: true,
      default: () => Math.random().toString(16).substring(2, 9)
    },
    environment: {
      type: String,
      enum: ['Development', 'Staging', 'Production'],
      required: true
    },
    status: {
      type: String,
      enum: ['QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'QUEUED'
    },
    triggeredBy: {
      type: String,
      default: 'Manual / Admin'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    },
    duration: {
      type: Number, // in seconds
      default: null
    },
    message: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

deploymentSchema.index({ service: 1, createdAt: -1 });

module.exports = mongoose.model('Deployment', deploymentSchema);
