/**
 * Constants
 * Application-wide constants and enumerations
 */

// Data formats (must match contract enum)
const DATA_FORMATS = {
  AUDIO: 0,
  CSV: 1,
  IMAGE: 2,
  TEXT: 3,
  VIDEO: 4,
  MIXED: 5
};

// Data format names
const DATA_FORMAT_NAMES = ['AUDIO', 'CSV', 'IMAGE', 'TEXT', 'VIDEO', 'MIXED'];

// Request status
const REQUEST_STATUS = {
  OPEN: 0,
  CLOSED: 1
};

const REQUEST_STATUS_NAMES = ['OPEN', 'CLOSED'];

// Submission status
const SUBMISSION_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  PAID: 3,
  REFUNDED: 4
};

const SUBMISSION_STATUS_NAMES = ['PENDING', 'APPROVED', 'REJECTED', 'PAID', 'REFUNDED'];

// Quality score thresholds
const QUALITY_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  ACCEPTABLE: 60,
  POOR: 40,
  UNACCEPTABLE: 0
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  AUDIO: 100 * 1024 * 1024,      // 100MB
  CSV: 50 * 1024 * 1024,         // 50MB
  IMAGE: 20 * 1024 * 1024,       // 20MB per image
  TEXT: 10 * 1024 * 1024,        // 10MB
  VIDEO: 500 * 1024 * 1024,      // 500MB
  MIXED: 1024 * 1024 * 1024      // 1GB
};

// Supported file extensions by format
const FILE_EXTENSIONS = {
  AUDIO: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
  CSV: ['csv', 'tsv', 'txt'],
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  TEXT: ['txt', 'json', 'xml', 'md', 'html', 'csv'],
  VIDEO: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
  MIXED: [] // All formats allowed
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Error codes
const ERROR_CODES = {
  // Validation errors (1xxx)
  VALIDATION_ERROR: 1000,
  INVALID_ADDRESS: 1001,
  INVALID_FORMAT: 1002,
  INVALID_PARAMETERS: 1003,
  FILE_TOO_LARGE: 1004,
  
  // Authentication errors (2xxx)
  UNAUTHORIZED: 2000,
  INVALID_SIGNATURE: 2001,
  TOKEN_EXPIRED: 2002,
  
  // Business logic errors (3xxx)
  REQUEST_NOT_FOUND: 3000,
  SUBMISSION_NOT_FOUND: 3001,
  REQUEST_CLOSED: 3002,
  ALREADY_SUBMITTED: 3003,
  INSUFFICIENT_BUDGET: 3004,
  NOT_WHITELISTED: 3005,
  MODEL_NOT_REGISTERED: 3006,
  
  // Blockchain errors (4xxx)
  BLOCKCHAIN_ERROR: 4000,
  TRANSACTION_FAILED: 4001,
  CONTRACT_ERROR: 4002,
  INSUFFICIENT_GAS: 4003,
  
  // Storage errors (5xxx)
  IPFS_ERROR: 5000,
  S3_ERROR: 5001,
  UPLOAD_FAILED: 5002,
  
  // AI/Quality errors (6xxx)
  QUALITY_CHECK_FAILED: 6000,
  AI_MODEL_ERROR: 6001,
  VERIFICATION_ERROR: 6002,
  
  // System errors (9xxx)
  DATABASE_ERROR: 9000,
  INTERNAL_ERROR: 9001,
  SERVICE_UNAVAILABLE: 9002
};

// Event names (from smart contract)
const CONTRACT_EVENTS = {
  REQUEST_CREATED: 'RequestCreated',
  SUBMISSION_SUBMITTED: 'SubmissionSubmitted',
  SUBMISSION_VERIFIED: 'SubmissionVerified',
  PAYMENT_RELEASED: 'PaymentReleased',
  REFUND_ISSUED: 'RefundIssued',
  QUALITY_VERIFIER_UPDATED: 'QualityVerifierUpdated',
  SELLER_WHITELIST_UPDATED: 'SellerWhitelistUpdated',
  MODEL_REGISTRY_UPDATED: 'ModelRegistryUpdated'
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Cache TTL (in seconds)
const CACHE_TTL = {
  REQUEST: 300,        // 5 minutes
  SUBMISSION: 300,     // 5 minutes
  VERIFICATION: 600,   // 10 minutes
  BLOCKCHAIN_DATA: 60, // 1 minute
  STATS: 1800         // 30 minutes
};

// Notification types
const NOTIFICATION_TYPES = {
  REQUEST_CREATED: 'request_created',
  SUBMISSION_RECEIVED: 'submission_received',
  VERIFICATION_COMPLETED: 'verification_completed',
  PAYMENT_RELEASED: 'payment_released',
  REFUND_ISSUED: 'refund_issued'
};

// AI model operation types
const AI_OPERATION_TYPES = {
  GENERATION: 'generation',
  VERIFICATION: 'verification',
  QUALITY_CHECK: 'quality_check',
  PREPROCESSING: 'preprocessing',
  POSTPROCESSING: 'postprocessing'
};

// Quality metrics
const QUALITY_METRICS = {
  ACCURACY: 'accuracy',
  COMPLETENESS: 'completeness',
  CONSISTENCY: 'consistency',
  VALIDITY: 'validity',
  UNIQUENESS: 'uniqueness',
  FORMAT_COMPLIANCE: 'formatCompliance',
  DISTRIBUTION_SCORE: 'distributionScore',
  DIVERSITY_SCORE: 'diversityScore',
  SYNTHETIC_QUALITY: 'syntheticQuality',
  PRIVACY_PRESERVATION: 'privacyPreservation',
  BIAS_SCORE: 'biasScore'
};

// Issue severity levels
const ISSUE_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

module.exports = {
  DATA_FORMATS,
  DATA_FORMAT_NAMES,
  REQUEST_STATUS,
  REQUEST_STATUS_NAMES,
  SUBMISSION_STATUS,
  SUBMISSION_STATUS_NAMES,
  QUALITY_THRESHOLDS,
  FILE_SIZE_LIMITS,
  FILE_EXTENSIONS,
  HTTP_STATUS,
  ERROR_CODES,
  CONTRACT_EVENTS,
  PAGINATION,
  CACHE_TTL,
  NOTIFICATION_TYPES,
  AI_OPERATION_TYPES,
  QUALITY_METRICS,
  ISSUE_SEVERITY
};
