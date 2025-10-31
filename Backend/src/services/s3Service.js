const AWS = require('aws-sdk');
const { config } = require('../config');

/**
 * S3 Service
 * Handles file storage and retrieval from AWS S3 or compatible storage
 */

class S3Service {
  constructor() {
    this.s3 = null;
    this.bucket = null;
    this.initialized = false;
  }

  /**
   * Initialize S3 client
   */
  async initialize() {
    try {
      if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
        console.warn('⚠️  AWS credentials not configured, S3 service disabled');
        return false;
      }

      const s3Config = {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
        region: config.aws.region
      };

      // Support custom S3-compatible endpoints
      if (config.aws.s3Endpoint) {
        s3Config.endpoint = config.aws.s3Endpoint;
        s3Config.s3ForcePathStyle = true;
      }

      this.s3 = new AWS.S3(s3Config);
      this.bucket = config.aws.s3Bucket;

      // Test connection
      await this.s3.headBucket({ Bucket: this.bucket }).promise();
      
      console.log(`✅ Connected to S3 bucket: ${this.bucket}`);
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ S3 initialization error:', error.message);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Ensure service is initialized
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('S3 service not initialized');
    }
  }

  /**
   * Upload file to S3
   */
  async uploadFile(fileBuffer, key, contentType = 'application/octet-stream', metadata = {}) {
    this.ensureInitialized();

    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        Metadata: metadata
      };

      const result = await this.s3.upload(params).promise();
      
      console.log(`📤 Uploaded to S3: ${key}`);
      
      return {
        url: result.Location,
        key: result.Key,
        etag: result.ETag
      };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Upload dataset files
   */
  async uploadDataset(submissionId, fileBuffer, fileName, contentType) {
    const key = `datasets/${submissionId}/${fileName}`;
    
    const metadata = {
      submissionId: submissionId.toString(),
      uploadedAt: new Date().toISOString()
    };

    return await this.uploadFile(fileBuffer, key, contentType, metadata);
  }

  /**
   * Get file from S3
   */
  async getFile(key) {
    this.ensureInitialized();

    try {
      const params = {
        Bucket: this.bucket,
        Key: key
      };

      const result = await this.s3.getObject(params).promise();
      
      return {
        body: result.Body,
        contentType: result.ContentType,
        metadata: result.Metadata
      };
    } catch (error) {
      console.error(`Error getting file from S3 (${key}):`, error);
      throw new Error(`S3 retrieval failed: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key) {
    this.ensureInitialized();

    try {
      const params = {
        Bucket: this.bucket,
        Key: key
      };

      await this.s3.deleteObject(params).promise();
      console.log(`🗑️  Deleted from S3: ${key}`);
      return true;
    } catch (error) {
      console.error(`Error deleting file from S3 (${key}):`, error);
      throw new Error(`S3 deletion failed: ${error.message}`);
    }
  }

  /**
   * Generate pre-signed URL for file access
   */
  async getSignedUrl(key, expiresIn = 3600) {
    this.ensureInitialized();

    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn // seconds
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      
      return {
        url,
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      };
    } catch (error) {
      console.error(`Error generating signed URL (${key}):`, error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Generate pre-signed URL for upload
   */
  async getUploadSignedUrl(key, contentType, expiresIn = 3600) {
    this.ensureInitialized();

    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
        Expires: expiresIn
      };

      const url = await this.s3.getSignedUrlPromise('putObject', params);
      
      return {
        url,
        key,
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error generating upload signed URL:', error);
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }

  /**
   * List files in a prefix/folder
   */
  async listFiles(prefix = '') {
    this.ensureInitialized();

    try {
      const params = {
        Bucket: this.bucket,
        Prefix: prefix
      };

      const result = await this.s3.listObjectsV2(params).promise();
      
      return result.Contents.map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        etag: item.ETag
      }));
    } catch (error) {
      console.error('Error listing files from S3:', error);
      throw new Error(`S3 list failed: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key) {
    this.ensureInitialized();

    try {
      await this.s3.headObject({
        Bucket: this.bucket,
        Key: key
      }).promise();
      
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Copy file within S3
   */
  async copyFile(sourceKey, destinationKey) {
    this.ensureInitialized();

    try {
      const params = {
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey
      };

      await this.s3.copyObject(params).promise();
      console.log(`📋 Copied in S3: ${sourceKey} -> ${destinationKey}`);
      return true;
    } catch (error) {
      console.error('Error copying file in S3:', error);
      throw new Error(`S3 copy failed: ${error.message}`);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key) {
    this.ensureInitialized();

    try {
      const result = await this.s3.headObject({
        Bucket: this.bucket,
        Key: key
      }).promise();

      return {
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        etag: result.ETag,
        metadata: result.Metadata
      };
    } catch (error) {
      console.error(`Error getting file metadata (${key}):`, error);
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }
}

module.exports = new S3Service();
