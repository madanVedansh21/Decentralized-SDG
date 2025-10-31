const mongoose = require('mongoose');

/**
 * DataRequest Schema
 * Mirrors the Request struct from SyntheticDataMarket.sol
 * Stores buyer's data requests with escrow and verification details
 */
const dataRequestSchema = new mongoose.Schema({
  // On-chain request ID from smart contract
  requestId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  
  // Buyer's wallet address (Ethereum address)
  buyerAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  
  // Human-readable description of data requirements
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Budget in wei (as string to handle big numbers)
  budget: {
    type: String,
    required: true
  },
  
  // Bitmask representing accepted data formats
  formatsMask: {
    type: Number,
    required: true
  },
  
  // Array of accepted format names for easier querying
  acceptedFormats: [{
    type: String,
    enum: ['AUDIO', 'CSV', 'IMAGE', 'TEXT', 'VIDEO', 'MIXED']
  }],
  
  // Request status: OPEN or CLOSED
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED'],
    default: 'OPEN',
    index: true
  },
  
  // IPFS CID of the QA report (set after verification)
  ipfsReportCid: {
    type: String,
    default: null
  },
  
  // IPFS CID of the dataset hash (optional, for reference)
  datasetHashCid: {
    type: String,
    default: null
  },
  
  // S3 URL or other storage URL for dataset (off-chain)
  datasetS3URL: {
    type: String,
    default: null
  },
  
  // Quality score (0-100) from verification
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  
  // Whether submission was approved
  approved: {
    type: Boolean,
    default: null
  },
  
  // Whether payment was released to seller
  paymentReleased: {
    type: Boolean,
    default: false
  },
  
  // Submission ID that finalized this request
  finalizedSubmissionId: {
    type: Number,
    default: null,
    ref: 'Submission'
  },
  
  // Transaction hash for request creation
  creationTxHash: {
    type: String,
    default: null
  },
  
  // Transaction hash for finalization (payment/refund)
  finalizationTxHash: {
    type: String,
    default: null
  },
  
  // Timestamp when request was finalized
  finalizedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'datarequests'
});

// Indexes for efficient queries
dataRequestSchema.index({ buyerAddress: 1, createdAt: -1 });
dataRequestSchema.index({ status: 1, createdAt: -1 });
dataRequestSchema.index({ acceptedFormats: 1 });

// Virtual for budget in ETH
dataRequestSchema.virtual('budgetInEth').get(function() {
  const { ethers } = require('ethers');
  return ethers.formatEther(this.budget);
});

// Method to check if request accepts a specific format
dataRequestSchema.methods.acceptsFormat = function(format) {
  return this.acceptedFormats.includes(format);
};

// Static method to decode formats mask into array
dataRequestSchema.statics.decodeFormatsMask = function(formatsMask) {
  const formats = ['AUDIO', 'CSV', 'IMAGE', 'TEXT', 'VIDEO', 'MIXED'];
  const accepted = [];
  
  formats.forEach((format, index) => {
    if (formatsMask & (1 << index)) {
      accepted.push(format);
    }
  });
  
  return accepted;
};

module.exports = mongoose.model('DataRequest', dataRequestSchema);
