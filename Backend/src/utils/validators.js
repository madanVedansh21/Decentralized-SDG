const { ethers } = require('ethers');
const { DATA_FORMAT_NAMES, FILE_EXTENSIONS } = require('./constants');

/**
 * Validators
 * Input validation utilities
 */

/**
 * Validate Ethereum address
 */
const isValidAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return ethers.isAddress(address);
};

/**
 * Validate and normalize Ethereum address
 */
const normalizeAddress = (address) => {
  if (!isValidAddress(address)) {
    throw new Error('Invalid Ethereum address');
  }
  return address.toLowerCase();
};

/**
 * Validate transaction hash
 */
const isValidTxHash = (hash) => {
  if (!hash || typeof hash !== 'string') {
    return false;
  }
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

/**
 * Validate IPFS CID
 */
const isValidIPFSCid = (cid) => {
  if (!cid || typeof cid !== 'string') {
    return false;
  }
  // Basic validation for CIDv0 and CIDv1
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58}|B[A-Z2-7]{58}|z[1-9A-HJ-NP-Za-km-z]{48}|F[0-9A-F]{50})$/.test(cid);
};

/**
 * Validate data format
 */
const isValidFormat = (format) => {
  if (typeof format === 'number') {
    return format >= 0 && format < DATA_FORMAT_NAMES.length;
  }
  if (typeof format === 'string') {
    return DATA_FORMAT_NAMES.includes(format.toUpperCase());
  }
  return false;
};

/**
 * Validate formats mask
 */
const isValidFormatsMask = (mask) => {
  if (typeof mask !== 'number') {
    return false;
  }
  // Must be between 1 and 63 (all formats enabled)
  return mask > 0 && mask <= 63;
};

/**
 * Validate quality score
 */
const isValidQualityScore = (score) => {
  if (typeof score !== 'number') {
    return false;
  }
  return score >= 0 && score <= 100;
};

/**
 * Validate file extension for format
 */
const isValidFileExtension = (extension, format) => {
  const formatName = typeof format === 'number' ? DATA_FORMAT_NAMES[format] : format.toUpperCase();
  const allowedExtensions = FILE_EXTENSIONS[formatName] || [];
  
  if (formatName === 'MIXED') {
    return true; // Mixed format allows all extensions
  }
  
  return allowedExtensions.includes(extension.toLowerCase());
};

/**
 * Validate email address
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL
 */
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate pagination parameters
 */
const validatePagination = (page, limit, maxLimit = 100) => {
  const validPage = Math.max(1, parseInt(page, 10) || 1);
  const validLimit = Math.min(maxLimit, Math.max(1, parseInt(limit, 10) || 20));
  
  return {
    page: validPage,
    limit: validLimit,
    skip: (validPage - 1) * validLimit
  };
};

/**
 * Validate budget amount (in wei)
 */
const isValidBudget = (budget) => {
  try {
    const bn = ethers.getBigInt(budget);
    return bn > 0n;
  } catch {
    return false;
  }
};

/**
 * Validate file size
 */
const isValidFileSize = (size, maxSize) => {
  if (typeof size !== 'number' || size < 0) {
    return false;
  }
  return size <= maxSize;
};

/**
 * Validate sample count
 */
const isValidSampleCount = (count) => {
  return typeof count === 'number' && count >= 0 && Number.isInteger(count);
};

/**
 * Validate request ID
 */
const isValidRequestId = (id) => {
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0 && Number.isInteger(numId);
};

/**
 * Validate submission ID
 */
const isValidSubmissionId = (id) => {
  return isValidRequestId(id); // Same validation
};

/**
 * Sanitize string input
 */
const sanitizeString = (str, maxLength = 1000) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.trim().slice(0, maxLength);
};

/**
 * Validate and parse formats mask
 */
const parseFormatsMask = (formats) => {
  if (typeof formats === 'number') {
    return isValidFormatsMask(formats) ? formats : null;
  }
  
  if (Array.isArray(formats)) {
    let mask = 0;
    for (const format of formats) {
      const formatName = format.toUpperCase();
      const index = DATA_FORMAT_NAMES.indexOf(formatName);
      if (index !== -1) {
        mask |= (1 << index);
      }
    }
    return mask > 0 ? mask : null;
  }
  
  return null;
};

/**
 * Decode formats mask to array of format names
 */
const decodeFormatsMask = (mask) => {
  const formats = [];
  for (let i = 0; i < DATA_FORMAT_NAMES.length; i++) {
    if (mask & (1 << i)) {
      formats.push(DATA_FORMAT_NAMES[i]);
    }
  }
  return formats;
};

/**
 * Validate object has required fields
 */
const hasRequiredFields = (obj, fields) => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  return fields.every(field => obj.hasOwnProperty(field) && obj[field] !== undefined && obj[field] !== null);
};

module.exports = {
  isValidAddress,
  normalizeAddress,
  isValidTxHash,
  isValidIPFSCid,
  isValidFormat,
  isValidFormatsMask,
  isValidQualityScore,
  isValidFileExtension,
  isValidEmail,
  isValidUrl,
  validatePagination,
  isValidBudget,
  isValidFileSize,
  isValidSampleCount,
  isValidRequestId,
  isValidSubmissionId,
  sanitizeString,
  parseFormatsMask,
  decodeFormatsMask,
  hasRequiredFields
};
