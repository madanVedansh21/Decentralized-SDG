const mongoose = require('mongoose');

/**
 * Submission Schema
 * Mirrors the Submission struct from SyntheticDataMarket.sol
 * Stores seller submissions for buyer requests
 */
const submissionSchema = new mongoose.Schema({
  // On-chain submission ID from smart contract
  submissionId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  
  // Associated request ID
  requestId: {
    type: Number,
    required: true,
    index: true,
    ref: 'DataRequest'
  },
  
  // Seller's wallet address
  sellerAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  
  // AI model address that generated the data
  modelAddress: {
    type: String,
    required: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  
  // Data format
  format: {
    type: String,
    required: true,
    enum: ['AUDIO', 'CSV', 'IMAGE', 'TEXT', 'VIDEO', 'MIXED']
  },
  
  // File size in bytes
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Number of samples in the dataset
  sampleCount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Comma-separated file extensions (e.g., "wav,mp3")
  fileExtensions: {
    type: String,
    default: ''
  },
  
  // Reference to dataset (encrypted ID, IPFS CID, or post-approval link)
  datasetReference: {
    type: String,
    default: ''
  },
  
  // Off-chain storage details
  storageDetails: {
    ipfsCid: { type: String, default: null },
    s3Url: { type: String, default: null },
    encryptionKey: { type: String, default: null } // Encrypted key for buyer access
  },
  
  // Submission status
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID', 'REFUNDED'],
    default: 'PENDING',
    index: true
  },
  
  // Whether quality check has been performed
  qualityChecked: {
    type: Boolean,
    default: false
  },
  
  // Quality verification reference
  verificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QualityVerification',
    default: null
  },
  
  // Transaction hashes
  submissionTxHash: {
    type: String,
    default: null
  },
  
  verificationTxHash: {
    type: String,
    default: null
  },
  
  // Metadata for frontend display
  metadata: {
    description: { type: String, default: '' },
    tags: [{ type: String }],
    generationMethod: { type: String, default: '' },
    modelVersion: { type: String, default: '' }
  }
}, {
  timestamps: true,
  collection: 'submissions'
});

// Indexes
submissionSchema.index({ requestId: 1, sellerAddress: 1 });
submissionSchema.index({ sellerAddress: 1, createdAt: -1 });
submissionSchema.index({ status: 1, createdAt: -1 });
submissionSchema.index({ modelAddress: 1 });

// Virtual for file extensions array
submissionSchema.virtual('fileExtensionsArray').get(function() {
  return this.fileExtensions ? this.fileExtensions.split(',').map(ext => ext.trim()) : [];
});

// Method to check if submission is finalized
submissionSchema.methods.isFinalized = function() {
  return ['PAID', 'REFUNDED'].includes(this.status);
};

// Method to get human-readable file size
submissionSchema.methods.getFormattedFileSize = function() {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = this.fileSize;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

module.exports = mongoose.model('Submission', submissionSchema);
