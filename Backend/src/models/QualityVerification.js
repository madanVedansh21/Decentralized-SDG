const mongoose = require('mongoose');

/**
 * QualityVerification Schema
 * Stores quality check results for submissions
 * Links to QA reports on IPFS
 */
const qualityVerificationSchema = new mongoose.Schema({
  // Associated submission ID
  submissionId: {
    type: Number,
    required: true,
    index: true,
    ref: 'Submission'
  },
  
  // Associated request ID
  requestId: {
    type: Number,
    required: true,
    index: true,
    ref: 'DataRequest'
  },
  
  // Verifier address (quality verifier or model)
  verifiedBy: {
    type: String,
    required: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  
  // Whether submission was approved
  approved: {
    type: Boolean,
    required: true
  },
  
  // Overall quality score (0-100)
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // Detailed quality metrics
  metrics: {
    // Data quality metrics
    accuracy: { type: Number, min: 0, max: 100, default: null },
    completeness: { type: Number, min: 0, max: 100, default: null },
    consistency: { type: Number, min: 0, max: 100, default: null },
    validity: { type: Number, min: 0, max: 100, default: null },
    uniqueness: { type: Number, min: 0, max: 100, default: null },
    
    // Format-specific metrics
    formatCompliance: { type: Number, min: 0, max: 100, default: null },
    schemaValidation: { type: Boolean, default: null },
    
    // Statistical metrics
    distributionScore: { type: Number, min: 0, max: 100, default: null },
    diversityScore: { type: Number, min: 0, max: 100, default: null },
    
    // AI-specific metrics (for synthetic data)
    syntheticQuality: { type: Number, min: 0, max: 100, default: null },
    privacyPreservation: { type: Number, min: 0, max: 100, default: null },
    biasScore: { type: Number, min: 0, max: 100, default: null }
  },
  
  // IPFS CID of detailed QA report
  reportCid: {
    type: String,
    required: true
  },
  
  // Report metadata
  reportMetadata: {
    reportType: { type: String, default: 'automatic' }, // automatic or manual
    reportVersion: { type: String, default: '1.0' },
    toolsUsed: [{ type: String }],
    executionTime: { type: Number, default: null } // in seconds
  },
  
  // Verification notes/comments
  notes: {
    type: String,
    default: ''
  },
  
  // Issues found during verification
  issues: [{
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: '' }
  }],
  
  // Transaction hash for verification
  verificationTxHash: {
    type: String,
    default: null
  },
  
  // Timestamp of verification
  verifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'qualityverifications'
});

// Indexes
qualityVerificationSchema.index({ submissionId: 1 }, { unique: true });
qualityVerificationSchema.index({ requestId: 1 });
qualityVerificationSchema.index({ verifiedBy: 1, verifiedAt: -1 });
qualityVerificationSchema.index({ approved: 1 });
qualityVerificationSchema.index({ overallScore: -1 });

// Virtual for verification status
qualityVerificationSchema.virtual('status').get(function() {
  return this.approved ? 'APPROVED' : 'REJECTED';
});

// Method to check if verification passed minimum threshold
qualityVerificationSchema.methods.passesThreshold = function(threshold = 70) {
  return this.overallScore >= threshold;
};

// Method to get critical issues count
qualityVerificationSchema.methods.getCriticalIssuesCount = function() {
  return this.issues.filter(issue => issue.severity === 'critical').length;
};

// Method to generate summary
qualityVerificationSchema.methods.getSummary = function() {
  return {
    submissionId: this.submissionId,
    approved: this.approved,
    overallScore: this.overallScore,
    reportCid: this.reportCid,
    issuesCount: this.issues.length,
    criticalIssues: this.getCriticalIssuesCount(),
    verifiedAt: this.verifiedAt
  };
};

module.exports = mongoose.model('QualityVerification', qualityVerificationSchema);
