/**
 * Configuration Index
 * Central export point for all configuration modules
 */

const { blockchainService, CONTRACT_ABI } = require('./blockchain');
const { config, validateConfig, getConfig } = require('./env');

module.exports = {
  // Blockchain
  blockchainService,
  CONTRACT_ABI,
  
  // Environment
  config,
  validateConfig,
  getConfig
};
