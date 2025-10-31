/**
 * Configuration Index
 * Central export point for all configuration modules
 */

const { connectDB, disconnectDB } = require('./database');
const { blockchainService, CONTRACT_ABI } = require('./blockchain');
const { config, validateConfig, getConfig } = require('./env');

module.exports = {
  // Database
  connectDB,
  disconnectDB,
  
  // Blockchain
  blockchainService,
  CONTRACT_ABI,
  
  // Environment
  config,
  validateConfig,
  getConfig
};
