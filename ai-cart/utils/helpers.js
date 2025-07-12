const mongoose = require('mongoose');
const logger = require('./logger');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * Validates product ID format and existence
 * @param {string} productId 
 * @returns {Promise<boolean>}
 */
async function validateProductId(productId) {
  if (!/^p\d{5}$/.test(productId)) {
    logger.warn(`Invalid product ID format: ${productId}`);
    return false;
  }

  try {
    const exists = await Product.exists({ id: productId });
    if (!exists) logger.warn(`Product not found: ${productId}`);
    return exists;
  } catch (error) {
    logger.error(`Product validation error: ${error.message}`);
    return false;
  }
}

/**
 * Normalizes ingredients for consistent comparison
 * @param {string[]} ingredients 
 * @returns {string[]}
 */
function normalizeIngredients(ingredients) {
  return ingredients.map(ing =>
    ing.trim()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove diacritics
  );
}

/**
 * Calculates nutritional score based on health conditions
 * @param {Object} nutritionInfo 
 * @param {string[]} healthConditions 
 * @returns {number}
 */
function calculateNutritionScore(nutritionInfo, healthConditions) {
  let score = 100; // Base score

  // Penalize based on health conditions
  healthConditions.forEach(condition => {
    switch (condition.toLowerCase()) {
      case 'hypertension':
        score -= nutritionInfo.sodium * 0.5;
        break;
      case 'diabetes':
        score -= nutritionInfo.sugar * 2;
        break;
      case 'obesity':
        score -= (nutritionInfo.calories / 10) + (nutritionInfo.fat * 1.5);
        break;
    }
  });

  // Reward positive attributes
  score += nutritionInfo.protein * 0.5;
  score += nutritionInfo.fiber * 1.2;

  return Math.max(0, Math.round(score));
}

/**
 * Batch processes array with async function
 * @param {Array} array 
 * @param {Function} asyncFn 
 * @param {number} batchSize 
 * @returns {Promise<Array>}
 */
async function processInBatches(array, asyncFn, batchSize = 100) {
  const results = [];
  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(asyncFn));
    results.push(...batchResults);
    logger.debug(`Processed batch ${i / batchSize + 1}/${Math.ceil(array.length / batchSize)}`);
  }
  return results;
}

/**
 * Generates cache key from parameters
 * @param {string} prefix 
 * @param {Object} params 
 * @returns {string}
 */
function generateCacheKey(prefix, params) {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');

  return `${prefix}_${sortedParams}`;
}

module.exports = {
  validateProductId,
  normalizeIngredients,
  calculateNutritionScore,
  processInBatches,
  generateCacheKey,
  logger
};