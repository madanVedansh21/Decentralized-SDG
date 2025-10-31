const { ethers } = require('ethers');

/**
 * Blockchain Configuration
 * Handles connection to Ethereum network and smart contract
 */

// Contract ABI - simplified for key functions
const CONTRACT_ABI = [
  // Events
  "event RequestCreated(uint256 indexed requestId, address indexed buyer, uint256 budget, uint8 formatsMask, string description)",
  "event SubmissionSubmitted(uint256 indexed submissionId, uint256 indexed requestId, address indexed seller, address indexed model, uint8 format, uint256 fileSize, uint256 sampleCount, string fileExtensions, string datasetReference)",
  "event SubmissionVerified(uint256 indexed submissionId, uint256 indexed requestId, bool approved, uint8 qualityScore, string qualityReportCid)",
  "event PaymentReleased(uint256 indexed submissionId, address indexed seller, uint256 amount)",
  "event RefundIssued(uint256 indexed requestId, address indexed buyer, uint256 amount)",
  
  // Read functions
  "function owner() view returns (address)",
  "function qualityVerifier() view returns (address)",
  "function requests(uint256) view returns (uint256 id, address buyer, uint256 budget, uint8 formatsMask, string description, uint8 status, uint8 qualityScore, string qualityReportCid, uint256 finalizedSubmissionId, uint256 createdAt)",
  "function submissions(uint256) view returns (uint256 id, uint256 requestId, address seller, address model, uint8 format, uint256 fileSize, uint256 sampleCount, string fileExtensions, string datasetReference, uint8 status, bool qualityChecked, uint256 createdAt)",
  "function getBuyerRequests(address) view returns (uint256[])",
  "function getSellerSubmissions(address) view returns (uint256[])",
  "function getVerifierSubmissions(address) view returns (uint256[])",
  "function totalEscrowed() view returns (uint256)",
  
  // Write functions
  "function createRequest(uint8 formatsMask, string description) payable returns (uint256)",
  "function submitDataset(uint256 requestId, uint8 format, uint256 fileSize, uint256 sampleCount, string fileExtensions, string datasetReference, address model) returns (uint256)",
  "function verifySubmission(uint256 submissionId, bool approved, uint8 qualityScore, string qualityReportCid)",
  "function cancelRequest(uint256 requestId)",
  
  // Admin functions
  "function setQualityVerifier(address verifier)",
  "function updateSellerWhitelist(address seller, bool allowed)",
  "function updateModelRegistry(address model, bool allowed)",
  "function setWhitelistEnabled(bool enabled)",
  "function setModelRegistryEnabled(bool enabled)",
  "function setAllowModelSelfVerify(bool allow)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.signer = null;
    this.initialized = false;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      // Connect to provider
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
      if (!rpcUrl) {
        throw new Error('BLOCKCHAIN_RPC_URL not set in environment');
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Test connection
      const network = await this.provider.getNetwork();
      console.log(`✅ Connected to blockchain network: ${network.name} (chainId: ${network.chainId})`);

      // Initialize contract
      const contractAddress = process.env.CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('CONTRACT_ADDRESS not set in environment');
      }

      this.contract = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        this.provider
      );

      // Initialize signer if private key is provided
      const privateKey = process.env.VERIFIER_PRIVATE_KEY;
      if (privateKey) {
        this.signer = new ethers.Wallet(privateKey, this.provider);
        console.log(`✅ Verifier wallet initialized: ${this.signer.address}`);
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ Blockchain initialization error:', error.message);
      throw error;
    }
  }

  /**
   * Get contract instance with signer
   */
  getContractWithSigner() {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }
    return this.contract.connect(this.signer);
  }

  /**
   * Check if service is initialized
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Blockchain service not initialized');
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlock() {
    this.ensureInitialized();
    return await this.provider.getBlockNumber();
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash) {
    this.ensureInitialized();
    return await this.provider.getTransactionReceipt(txHash);
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash, confirmations = 1) {
    this.ensureInitialized();
    return await this.provider.waitForTransaction(txHash, confirmations);
  }
}

// Singleton instance
const blockchainService = new BlockchainService();

module.exports = {
  blockchainService,
  CONTRACT_ABI
};
