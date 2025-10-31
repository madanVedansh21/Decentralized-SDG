const dotenv = require('dotenv');
const path = require('path');

/**
 * Load environment variables
 */
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Environment Configuration
 * Centralizes all environment variables with defaults and validation
 */

const config = {
  // Application
  app: {
    name: process.env.APP_NAME || 'Synthetic Data Market API',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    apiVersion: process.env.API_VERSION || 'v1',
    baseUrl: process.env.BASE_URL || 'http://localhost:5000'
  },

  // Database
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/synthetic-data-market',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // Blockchain
  blockchain: {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
    contractAddress: process.env.CONTRACT_ADDRESS,
    chainId: parseInt(process.env.CHAIN_ID || '1', 10),
    networkName: process.env.NETWORK_NAME || 'mainnet',
    verifierPrivateKey: process.env.VERIFIER_PRIVATE_KEY,
    gasLimit: parseInt(process.env.GAS_LIMIT || '500000', 10),
    gasPriceMultiplier: parseFloat(process.env.GAS_PRICE_MULTIPLIER || '1.2'),
    confirmations: parseInt(process.env.CONFIRMATIONS || '2', 10)
  },

  // IPFS
  ipfs: {
    host: process.env.IPFS_HOST || 'ipfs.infura.io',
    port: parseInt(process.env.IPFS_PORT || '5001', 10),
    protocol: process.env.IPFS_PROTOCOL || 'https',
    projectId: process.env.IPFS_PROJECT_ID,
    projectSecret: process.env.IPFS_PROJECT_SECRET,
    gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
  },

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET,
    s3Endpoint: process.env.AWS_S3_ENDPOINT
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    corsOrigin: process.env.CORS_ORIGIN || '*',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
  },

  // AI Services
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
    stabilityApiKey: process.env.STABILITY_API_KEY,
    qualityCheckModel: process.env.QUALITY_CHECK_MODEL || 'default',
    qualityThreshold: parseFloat(process.env.QUALITY_THRESHOLD || '70')
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB
    allowedFormats: (process.env.ALLOWED_FORMATS || 'csv,json,txt,wav,mp3,jpg,png,mp4').split(','),
    tempDir: process.env.TEMP_DIR || './temp',
    cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL || '3600000', 10) // 1 hour
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    dir: process.env.LOG_DIR || './logs',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '14', 10),
    maxSize: process.env.LOG_MAX_SIZE || '20m'
  },

  // Email (optional)
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@syntheticdatamarket.com'
  },

  // Webhooks (optional)
  webhooks: {
    enabled: process.env.WEBHOOKS_ENABLED === 'true',
    secret: process.env.WEBHOOK_SECRET,
    retryAttempts: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS || '3', 10)
  },

  // Features
  features: {
    enableWhitelist: process.env.ENABLE_WHITELIST === 'true',
    enableModelRegistry: process.env.ENABLE_MODEL_REGISTRY === 'true',
    enableAutoVerification: process.env.ENABLE_AUTO_VERIFICATION === 'true',
    enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true'
  }
};

/**
 * Validate required configuration
 */
const validateConfig = () => {
  const required = [
    { key: 'MONGODB_URI', value: config.database.uri },
    { key: 'BLOCKCHAIN_RPC_URL', value: config.blockchain.rpcUrl },
    { key: 'CONTRACT_ADDRESS', value: config.blockchain.contractAddress }
  ];

  const missing = required.filter(item => !item.value);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(item => console.error(`   - ${item.key}`));
    throw new Error('Missing required environment variables');
  }

  console.log('✅ Configuration validated successfully');
};

/**
 * Get configuration value by path
 * Example: getConfig('blockchain.rpcUrl')
 */
const getConfig = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], config);
};

module.exports = {
  config,
  validateConfig,
  getConfig
};
