const { ethers } = require('ethers');

/**
 * Formatters
 * Utility functions to format data for API responses
 */

/**
 * Format wei amount to ETH string
 */
const formatWeiToEth = (wei) => {
  try {
    return ethers.formatEther(wei);
  } catch (error) {
    return '0';
  }
};

/**
 * Parse ETH amount to wei
 */
const parseEthToWei = (eth) => {
  try {
    return ethers.parseEther(eth.toString());
  } catch (error) {
    throw new Error('Invalid ETH amount');
  }
};

/**
 * Format file size to human-readable string
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
};

/**
 * Format timestamp to ISO string
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  if (typeof timestamp === 'number') {
    // Handle both seconds and milliseconds
    const date = timestamp > 10000000000 
      ? new Date(timestamp) 
      : new Date(timestamp * 1000);
    return date.toISOString();
  }
  
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  return timestamp;
};

/**
 * Format address to checksummed format
 */
const formatAddress = (address) => {
  try {
    return ethers.getAddress(address);
  } catch {
    return address;
  }
};

/**
 * Format request for API response
 */
const formatRequest = (request) => {
  return {
    requestId: request.requestId,
    buyerAddress: formatAddress(request.buyerAddress),
    description: request.description,
    budget: request.budget,
    budgetInEth: formatWeiToEth(request.budget),
    formatsMask: request.formatsMask,
    acceptedFormats: request.acceptedFormats,
    status: request.status,
    ipfsReportCid: request.ipfsReportCid,
    datasetHashCid: request.datasetHashCid,
    datasetS3URL: request.datasetS3URL,
    qualityScore: request.qualityScore,
    approved: request.approved,
    paymentReleased: request.paymentReleased,
    finalizedSubmissionId: request.finalizedSubmissionId,
    creationTxHash: request.creationTxHash,
    finalizationTxHash: request.finalizationTxHash,
    createdAt: formatTimestamp(request.createdAt),
    finalizedAt: formatTimestamp(request.finalizedAt),
    updatedAt: formatTimestamp(request.updatedAt)
  };
};

/**
 * Format submission for API response
 */
const formatSubmission = (submission) => {
  return {
    submissionId: submission.submissionId,
    requestId: submission.requestId,
    sellerAddress: formatAddress(submission.sellerAddress),
    modelAddress: formatAddress(submission.modelAddress),
    format: submission.format,
    fileSize: submission.fileSize,
    fileSizeFormatted: formatFileSize(submission.fileSize),
    sampleCount: submission.sampleCount,
    fileExtensions: submission.fileExtensions,
    datasetReference: submission.datasetReference,
    storageDetails: submission.storageDetails,
    status: submission.status,
    qualityChecked: submission.qualityChecked,
    verificationId: submission.verificationId,
    submissionTxHash: submission.submissionTxHash,
    verificationTxHash: submission.verificationTxHash,
    metadata: submission.metadata,
    createdAt: formatTimestamp(submission.createdAt),
    updatedAt: formatTimestamp(submission.updatedAt)
  };
};

/**
 * Format verification for API response
 */
const formatVerification = (verification) => {
  return {
    id: verification._id,
    submissionId: verification.submissionId,
    requestId: verification.requestId,
    verifiedBy: formatAddress(verification.verifiedBy),
    approved: verification.approved,
    overallScore: verification.overallScore,
    metrics: verification.metrics,
    reportCid: verification.reportCid,
    reportMetadata: verification.reportMetadata,
    notes: verification.notes,
    issues: verification.issues,
    verificationTxHash: verification.verificationTxHash,
    verifiedAt: formatTimestamp(verification.verifiedAt),
    createdAt: formatTimestamp(verification.createdAt)
  };
};

/**
 * Format AI model log for API response
 */
const formatAIModelLog = (log) => {
  return {
    id: log._id,
    modelAddress: formatAddress(log.modelAddress),
    modelInfo: log.modelInfo,
    submissionId: log.submissionId,
    requestId: log.requestId,
    operationType: log.operationType,
    inputParameters: log.inputParameters,
    outputMetadata: log.outputMetadata,
    performance: log.performance,
    status: log.status,
    error: log.error,
    outputs: log.outputs,
    selfVerificationScore: log.selfVerificationScore,
    isRegistered: log.isRegistered,
    createdAt: formatTimestamp(log.createdAt),
    completedAt: formatTimestamp(log.completedAt)
  };
};

/**
 * Format pagination metadata
 */
const formatPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    currentPage: page,
    pageSize: limit,
    totalItems: total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
};

/**
 * Format error response
 */
const formatError = (error, code = null) => {
  return {
    success: false,
    error: {
      message: error.message || 'An error occurred',
      code: code || error.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && error.stack && { stack: error.stack })
    }
  };
};

/**
 * Format success response
 */
const formatSuccess = (data, message = null) => {
  return {
    success: true,
    ...(message && { message }),
    ...(data && { data })
  };
};

/**
 * Format list response with pagination
 */
const formatListResponse = (items, page, limit, total, formatter = null) => {
  const formattedItems = formatter ? items.map(formatter) : items;
  
  return {
    success: true,
    data: formattedItems,
    pagination: formatPagination(page, limit, total)
  };
};

/**
 * Truncate string with ellipsis
 */
const truncate = (str, maxLength = 50) => {
  if (!str || str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};

/**
 * Format duration in milliseconds to human-readable string
 */
const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`;
  return `${(ms / 3600000).toFixed(2)}h`;
};

/**
 * Format quality score with grade
 */
const formatQualityScore = (score) => {
  let grade = 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  
  return {
    score,
    grade,
    percentage: `${score}%`
  };
};

module.exports = {
  formatWeiToEth,
  parseEthToWei,
  formatFileSize,
  formatTimestamp,
  formatAddress,
  formatRequest,
  formatSubmission,
  formatVerification,
  formatAIModelLog,
  formatPagination,
  formatError,
  formatSuccess,
  formatListResponse,
  truncate,
  formatDuration,
  formatQualityScore
};
