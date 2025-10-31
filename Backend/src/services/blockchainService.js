const { ethers } = require("ethers");
const { blockchainService } = require("../config");
// const { DataRequest, Submission } = require('../models'); // Models are not used, comment out or remove
const {
  decodeFormatsMask,
  DATA_FORMAT_NAMES,
  REQUEST_STATUS_NAMES,
  SUBMISSION_STATUS_NAMES,
} = require("../utils");

/**
 * Blockchain Service
 * Handles all blockchain interactions with the smart contract
 */

class BlockchainInteraction {
  /**
   * Sync request from blockchain to database
   */
  async syncRequest(requestId) {
    try {
      blockchainService.ensureInitialized();

      const contractRequest = await blockchainService.contract.requests(
        requestId
      );

      // Check if request exists on chain
      if (contractRequest.id.toString() === "0") {
        throw new Error(`Request ${requestId} not found on blockchain`);
      }

      const formats = decodeFormatsMask(contractRequest.formatsMask);

      const requestData = {
        requestId: Number(contractRequest.id),
        buyerAddress: contractRequest.buyer.toLowerCase(),
        description: contractRequest.description,
        budget: contractRequest.budget.toString(),
        formatsMask: contractRequest.formatsMask,
        acceptedFormats: formats,
        status: REQUEST_STATUS_NAMES[contractRequest.status],
        qualityScore: contractRequest.qualityScore || null,
        ipfsReportCid: contractRequest.qualityReportCid || null,
        finalizedSubmissionId:
          contractRequest.finalizedSubmissionId.toString() !== "0"
            ? Number(contractRequest.finalizedSubmissionId)
            : null,
      };

      // No database model, just return requestData
      return requestData;
    } catch (error) {
      console.error(`Error syncing request ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * Sync submission from blockchain to database
   */
  async syncSubmission(submissionId) {
    try {
      blockchainService.ensureInitialized();

      const contractSubmission = await blockchainService.contract.submissions(
        submissionId
      );

      if (contractSubmission.id.toString() === "0") {
        throw new Error(`Submission ${submissionId} not found on blockchain`);
      }

      const submissionData = {
        submissionId: Number(contractSubmission.id),
        requestId: Number(contractSubmission.requestId),
        sellerAddress: contractSubmission.seller.toLowerCase(),
        modelAddress: contractSubmission.model.toLowerCase(),
        format: DATA_FORMAT_NAMES[contractSubmission.format],
        fileSize: Number(contractSubmission.fileSize),
        sampleCount: Number(contractSubmission.sampleCount),
        fileExtensions: contractSubmission.fileExtensions,
        datasetReference: contractSubmission.datasetReference,
        status: SUBMISSION_STATUS_NAMES[contractSubmission.status],
        qualityChecked: contractSubmission.qualityChecked,
      };

      // No database model, just return submissionData
      return submissionData;
    } catch (error) {
      console.error(`Error syncing submission ${submissionId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new request on the blockchain
   */
  async createRequest(formatsMask, description, budgetInWei) {
    try {
      blockchainService.ensureInitialized();

      if (!blockchainService.signer) {
        throw new Error("Signer not available. Cannot create request.");
      }

      const contract = blockchainService.getContractWithSigner();

      const tx = await contract.createRequest(formatsMask, description, {
        value: budgetInWei,
      });

      console.log(`Request creation transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();

      // Parse event to get request ID
      const event = receipt.logs.find((log) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === "RequestCreated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = contract.interface.parseLog(event);
        const requestId = Number(parsedEvent.args.requestId);

        // Sync to database
        await this.syncRequest(requestId);

        return { requestId, txHash: tx.hash };
      }

      throw new Error("RequestCreated event not found in transaction receipt");
    } catch (error) {
      console.error("Error creating request on blockchain:", error);
      throw error;
    }
  }

  /**
   * Submit dataset to blockchain
   */
  async submitDataset(
    requestId,
    format,
    fileSize,
    sampleCount,
    fileExtensions,
    datasetReference,
    modelAddress
  ) {
    try {
      blockchainService.ensureInitialized();

      if (!blockchainService.signer) {
        throw new Error("Signer not available. Cannot submit dataset.");
      }

      const contract = blockchainService.getContractWithSigner();

      const formatIndex = DATA_FORMAT_NAMES.indexOf(format);
      if (formatIndex === -1) {
        throw new Error("Invalid format");
      }

      const tx = await contract.submitDataset(
        requestId,
        formatIndex,
        fileSize,
        sampleCount,
        fileExtensions,
        datasetReference,
        modelAddress
      );

      console.log(`Submission transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();

      // Parse event to get submission ID
      const event = receipt.logs.find((log) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === "SubmissionSubmitted";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = contract.interface.parseLog(event);
        const submissionId = Number(parsedEvent.args.submissionId);

        // Sync to database
        await this.syncSubmission(submissionId);

        return { submissionId, txHash: tx.hash };
      }

      throw new Error(
        "SubmissionSubmitted event not found in transaction receipt"
      );
    } catch (error) {
      console.error("Error submitting dataset on blockchain:", error);
      throw error;
    }
  }

  /**
   * Verify submission on blockchain
   */
  async verifySubmission(
    submissionId,
    approved,
    qualityScore,
    qualityReportCid
  ) {
    try {
      blockchainService.ensureInitialized();

      if (!blockchainService.signer) {
        throw new Error("Signer not available. Cannot verify submission.");
      }

      const contract = blockchainService.getContractWithSigner();

      const tx = await contract.verifySubmission(
        submissionId,
        approved,
        qualityScore,
        qualityReportCid
      );

      console.log(`Verification transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();

      // Sync both submission and request
      await this.syncSubmission(submissionId);

      // No database model, skip syncing request

      return { txHash: tx.hash, receipt };
    } catch (error) {
      console.error("Error verifying submission on blockchain:", error);
      throw error;
    }
  }

  /**
   * Get buyer's requests from blockchain
   */
  async getBuyerRequests(buyerAddress) {
    try {
      blockchainService.ensureInitialized();

      const requestIds = await blockchainService.contract.getBuyerRequests(
        buyerAddress
      );
      return requestIds.map((id) => Number(id));
    } catch (error) {
      console.error("Error fetching buyer requests:", error);
      throw error;
    }
  }

  /**
   * Get seller's submissions from blockchain
   */
  async getSellerSubmissions(sellerAddress) {
    try {
      blockchainService.ensureInitialized();

      const submissionIds =
        await blockchainService.contract.getSellerSubmissions(sellerAddress);
      return submissionIds.map((id) => Number(id));
    } catch (error) {
      console.error("Error fetching seller submissions:", error);
      throw error;
    }
  }

  /**
   * Get total escrowed amount
   */
  async getTotalEscrowed() {
    try {
      blockchainService.ensureInitialized();

      const total = await blockchainService.contract.totalEscrowed();
      return total.toString();
    } catch (error) {
      console.error("Error fetching total escrowed:", error);
      throw error;
    }
  }

  /**
   * Listen to contract events
   */
  setupEventListeners(handlers = {}) {
    try {
      blockchainService.ensureInitialized();

      const contract = blockchainService.contract;

      if (handlers.onRequestCreated) {
        contract.on(
          "RequestCreated",
          async (requestId, buyer, budget, formatsMask, description, event) => {
            console.log(`📝 RequestCreated event: ${requestId}`);
            await this.syncRequest(Number(requestId));
            handlers.onRequestCreated({
              requestId: Number(requestId),
              buyer,
              budget,
              formatsMask,
              description,
              event,
            });
          }
        );
      }

      if (handlers.onSubmissionSubmitted) {
        contract.on(
          "SubmissionSubmitted",
          async (
            submissionId,
            requestId,
            seller,
            model,
            format,
            fileSize,
            sampleCount,
            fileExtensions,
            datasetReference,
            event
          ) => {
            console.log(`📤 SubmissionSubmitted event: ${submissionId}`);
            await this.syncSubmission(Number(submissionId));
            handlers.onSubmissionSubmitted({
              submissionId: Number(submissionId),
              requestId: Number(requestId),
              seller,
              model,
              event,
            });
          }
        );
      }

      if (handlers.onSubmissionVerified) {
        contract.on(
          "SubmissionVerified",
          async (
            submissionId,
            requestId,
            approved,
            qualityScore,
            qualityReportCid,
            event
          ) => {
            console.log(`✅ SubmissionVerified event: ${submissionId}`);
            await this.syncSubmission(Number(submissionId));
            await this.syncRequest(Number(requestId));
            handlers.onSubmissionVerified({
              submissionId: Number(submissionId),
              requestId: Number(requestId),
              approved,
              qualityScore,
              qualityReportCid,
              event,
            });
          }
        );
      }

      console.log("✅ Event listeners set up");
    } catch (error) {
      console.error("Error setting up event listeners:", error);
      throw error;
    }
  }
}

module.exports = new BlockchainInteraction();
