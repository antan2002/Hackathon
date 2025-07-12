const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Safe MongoDB document transform for lean queries
 * @param {mongoose.Document} doc 
 * @returns {Object}
 */
function transformDocument(doc) {
  if (doc instanceof mongoose.Document) {
    return doc.toObject({ virtuals: true });
  }
  return doc;
}

/**
 * Executes MongoDB transaction safely
 * @param {Function} transactionFn 
 * @param {mongoose.ClientSession} session 
 * @returns {Promise}
 */
async function runTransaction(transactionFn, session = null) {
  const shouldCommit = !session;
  session = session || await mongoose.startSession();
  
  try {
    session.startTransaction();
    const result = await transactionFn(session);
    if (shouldCommit) {
      await session.commitTransaction();
    }
    return result;
  } catch (error) {
    if (shouldCommit) {
      await session.abortTransaction();
    }
    logger.error(`Transaction failed: ${error.message}`);
    throw error;
  } finally {
    if (shouldCommit) {
      session.endSession();
    }
  }
}

/**
 * Creates index if not exists
 * @param {mongoose.Model} model 
 * @param {Object} indexSpec 
 * @param {Object} options 
 */
async function ensureIndex(model, indexSpec, options = {}) {
  try {
    await model.collection.createIndex(indexSpec, options);
    logger.debug(`Index ensured for ${model.modelName}: ${JSON.stringify(indexSpec)}`);
  } catch (error) {
    logger.error(`Index creation failed: ${error.message}`);
  }
}

module.exports = {
  transformDocument,
  runTransaction,
  ensureIndex
};