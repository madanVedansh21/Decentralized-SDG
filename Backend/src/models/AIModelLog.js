const mongoose = require('mongoose');

/**
 * AIModelLog Schema
 * Tracks AI model outputs, performance, and usage
 */
const aiModelLogSchema = new mongoose.Schema({
  // Model's wallet address
  modelAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  
  // Model information
  modelInfo: {
    name: { type: String, required: true },
    version: { type: String, required: true },
    type: { type: String, required: true }, // e.g., "GPT", "Stable Diffusion", "AudioGen"
    provider: { type: String, default: '' },
    description: { type: String, default: '' }
  },
  
  // Associated submission (if applicable)
  submissionId: {
    type: Number,
    default: null,
    ref: 'Submission'
  },
  
  // Associated request
  requestId: {
    type: Number,
    default: null,
    ref: 'DataRequest'
  },
  
  // Operation type
  operationType: {
    type: String,
    required: true,
    enum: ['generation', 'verification', 'quality_check', 'preprocessing', 'postprocessing']
  },
  
  // Input parameters used
  inputParameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Output metadata
  outputMetadata: {
    itemsGenerated: { type: Number, default: 0 },
    totalSize: { type: Number, default: 0 }, // in bytes
    format: { type: String, default: '' },
    quality: { type: String, default: '' },
    processingTime: { type: Number, default: null } // in seconds
  },
  
  // Performance metrics
  performance: {
    executionTime: { type: Number, required: true }, // in milliseconds
    cpuUsage: { type: Number, default: null },
    memoryUsage: { type: Number, default: null }, // in MB
    gpuUsage: { type: Number, default: null },
    costEstimate: { type: Number, default: null } // in USD
  },
  
  // Status of the operation
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Error details (if failed)
  error: {
    message: { type: String, default: null },
    code: { type: String, default: null },
    stack: { type: String, default: null }
  },
  
  // Output references
  outputs: {
    ipfsCid: { type: String, default: null },
    s3Url: { type: String, default: null },
    localPath: { type: String, default: null }
  },
  
  // Quality score (if self-verification was performed)
  selfVerificationScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  
  // Whether this model is whitelisted/registered
  isRegistered: {
    type: Boolean,
    default: false
  },
  
  // Timestamp when operation completed
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'aimodellogs'
});

// Indexes
aiModelLogSchema.index({ modelAddress: 1, createdAt: -1 });
aiModelLogSchema.index({ submissionId: 1 });
aiModelLogSchema.index({ requestId: 1 });
aiModelLogSchema.index({ status: 1, createdAt: -1 });
aiModelLogSchema.index({ 'modelInfo.type': 1 });
aiModelLogSchema.index({ operationType: 1 });

// Virtual for success rate
aiModelLogSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

// Method to mark as completed
aiModelLogSchema.methods.markCompleted = function(outputData) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (outputData) {
    this.outputs = { ...this.outputs, ...outputData };
  }
  return this.save();
};

// Method to mark as failed
aiModelLogSchema.methods.markFailed = function(errorMessage, errorCode = null) {
  this.status = 'failed';
  this.completedAt = new Date();
  this.error = {
    message: errorMessage,
    code: errorCode,
    stack: new Error().stack
  };
  return this.save();
};

// Static method to get model performance stats
aiModelLogSchema.statics.getModelStats = async function(modelAddress) {
  const stats = await this.aggregate([
    { $match: { modelAddress: modelAddress.toLowerCase() } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgExecutionTime: { $avg: '$performance.executionTime' },
        avgScore: { $avg: '$selfVerificationScore' }
      }
    }
  ]);
  
  return stats;
};

// Static method to get model usage by operation type
aiModelLogSchema.statics.getOperationStats = async function(modelAddress) {
  const stats = await this.aggregate([
    { $match: { modelAddress: modelAddress.toLowerCase() } },
    {
      $group: {
        _id: '$operationType',
        count: { $sum: 1 },
        avgExecutionTime: { $avg: '$performance.executionTime' }
      }
    }
  ]);
  
  return stats;
};

module.exports = mongoose.model('AIModelLog', aiModelLogSchema);
