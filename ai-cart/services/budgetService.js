'use strict';

const User = require('../models/User');
const Product = require('../models/Product');
const logger = require('../utils/logger');

function calculateBudgetRange(avgOrderValue) {
  return {
    min: parseFloat((avgOrderValue * 0.7).toFixed(2)),
    max: parseFloat((avgOrderValue * 1.3).toFixed(2)),
  };
}

async function filterProductsByBudget(userId, productIds) {
  try {
    const user = await User.findById(userId).select('averageOrderValue').lean();
    if (!user || !user.averageOrderValue) {
      logger.warn('User not found or missing averageOrderValue');
      return [];
    }

    const budgetRange = calculateBudgetRange(user.averageOrderValue);

    const products = await Product.find({
      id: { $in: productIds },
      price: { $gte: budgetRange.min, $lte: budgetRange.max }
    }, { id: 1 });

    return products.map(p => p.id);
  } catch (error) {
    logger.error('Error in filterProductsByBudget:', error);
    return [];
  }
}

module.exports = {
  filterProductsByBudget
};
