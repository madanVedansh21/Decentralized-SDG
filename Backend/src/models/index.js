/**
 * Model Index
 * Central export point for all database models
 */

const DataRequest = require('./DataRequest');
const Submission = require('./Submission');
const QualityVerification = require('./QualityVerification');
const AIModelLog = require('./AIModelLog');

module.exports = {
  DataRequest,
  Submission,
  QualityVerification,
  AIModelLog
};
