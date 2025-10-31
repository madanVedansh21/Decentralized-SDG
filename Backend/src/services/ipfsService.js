const { create } = require('ipfs-http-client');
const { config } = require('../config');

/**
 * IPFS Service
 * Handles uploading and retrieving files from IPFS
 */

class IPFSService {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  /**
   * Initialize IPFS client
   */
  async initialize() {
    try {
      const auth = config.ipfs.projectId && config.ipfs.projectSecret
        ? 'Basic ' + Buffer.from(config.ipfs.projectId + ':' + config.ipfs.projectSecret).toString('base64')
        : undefined;

      this.client = create({
        host: config.ipfs.host,
        port: config.ipfs.port,
        protocol: config.ipfs.protocol,
        headers: auth ? { authorization: auth } : undefined
      });

      // Test connection
      const version = await this.client.version();
      console.log(`✅ Connected to IPFS: ${version.version}`);
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ IPFS initialization error:', error.message);
      // Don't throw - IPFS is optional
      this.initialized = false;
      return false;
    }
  }

  /**
   * Ensure service is initialized
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('IPFS service not initialized');
    }
  }

  /**
   * Upload content to IPFS
   */
  async uploadContent(content) {
    this.ensureInitialized();
    
    try {
      const result = await this.client.add(content);
      console.log(`📤 Uploaded to IPFS: ${result.path}`);
      return result.path; // CID
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Upload JSON object to IPFS
   */
  async uploadJSON(jsonObject) {
    const content = JSON.stringify(jsonObject, null, 2);
    return await this.uploadContent(content);
  }

  /**
   * Upload file buffer to IPFS
   */
  async uploadFile(fileBuffer, options = {}) {
    this.ensureInitialized();
    
    try {
      const result = await this.client.add(fileBuffer, {
        pin: true,
        ...options
      });
      
      console.log(`📤 Uploaded file to IPFS: ${result.path}`);
      return result.path;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error(`IPFS file upload failed: ${error.message}`);
    }
  }

  /**
   * Get content from IPFS
   */
  async getContent(cid) {
    this.ensureInitialized();
    
    try {
      const chunks = [];
      for await (const chunk of this.client.cat(cid)) {
        chunks.push(chunk);
      }
      
      const content = Buffer.concat(chunks).toString('utf-8');
      return content;
    } catch (error) {
      console.error(`Error fetching from IPFS (${cid}):`, error);
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get JSON object from IPFS
   */
  async getJSON(cid) {
    const content = await this.getContent(cid);
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Invalid JSON content in IPFS');
    }
  }

  /**
   * Pin content to IPFS
   */
  async pinContent(cid) {
    this.ensureInitialized();
    
    try {
      await this.client.pin.add(cid);
      console.log(`📌 Pinned to IPFS: ${cid}`);
      return true;
    } catch (error) {
      console.error(`Error pinning to IPFS (${cid}):`, error);
      throw new Error(`IPFS pinning failed: ${error.message}`);
    }
  }

  /**
   * Unpin content from IPFS
   */
  async unpinContent(cid) {
    this.ensureInitialized();
    
    try {
      await this.client.pin.rm(cid);
      console.log(`📍 Unpinned from IPFS: ${cid}`);
      return true;
    } catch (error) {
      console.error(`Error unpinning from IPFS (${cid}):`, error);
      return false;
    }
  }

  /**
   * Get IPFS gateway URL for a CID
   */
  getGatewayUrl(cid) {
    return `${config.ipfs.gateway}${cid}`;
  }

  /**
   * Upload quality report to IPFS
   */
  async uploadQualityReport(reportData) {
    const report = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      ...reportData
    };
    
    const cid = await this.uploadJSON(report);
    
    // Pin the report
    await this.pinContent(cid);
    
    return {
      cid,
      gatewayUrl: this.getGatewayUrl(cid)
    };
  }

  /**
   * Upload dataset metadata to IPFS
   */
  async uploadDatasetMetadata(metadata) {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      ...metadata
    };
    
    const cid = await this.uploadJSON(data);
    
    return {
      cid,
      gatewayUrl: this.getGatewayUrl(cid)
    };
  }

  /**
   * Check if CID is valid and accessible
   */
  async verifyCID(cid) {
    try {
      this.ensureInitialized();
      
      // Try to get first few bytes
      let hasContent = false;
      for await (const chunk of this.client.cat(cid, { length: 1 })) {
        hasContent = chunk.length > 0;
        break;
      }
      
      return hasContent;
    } catch (error) {
      console.error(`CID verification failed (${cid}):`, error);
      return false;
    }
  }
}

module.exports = new IPFSService();
