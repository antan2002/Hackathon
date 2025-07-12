const Product = require('../models/Product');
const User = require('../models/User');
const healthFilterService = require('../services/healthFilterService');
const budgetService = require('../services/budgetService');
const recommendationService = require('../services/recommendationService');
const logger = require('../utils/logger');

async function addToCart(userId, productId) {
  try {
    const product = await Product.findOne({ id: productId });
    if (!product) throw new Error('Product not found');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const harmfulIngredients = await healthFilterService.getHarmfulIngredients(user.healthConditions || []);
    const hasHarmful = product.ingredients.some(i =>
      harmfulIngredients.includes(i.toLowerCase())
    );

    if (hasHarmful) {
      return {
        success: false,
        message: `This product contains ingredients that may not be suitable for your health conditions: ${user.healthConditions.join(', ')}`,
        harmfulIngredients: product.ingredients.filter(i => harmfulIngredients.includes(i.toLowerCase()))
      };
    }

    return { success: true, product };
  } catch (error) {
    logger.error('Error in addToCart:', error.message);
    return { success: false, error: 'Failed to add product to cart' };
  }
}

async function getCartRecommendations(userId, cartItems) {
  try {
    if (!Array.isArray(cartItems)) return { success: false, error: 'cartItems must be an array' };

    const validItems = cartItems.filter(p =>
      p.id && typeof p.category === 'string' && Array.isArray(p.ingredients)
    );

    if (!validItems.length) {
      return { success: false, error: 'Each cart item must contain id, category, and ingredients' };
    }

    const cartIds = validItems.map(i => i.id);
    const categories = [...new Set(validItems.map(i => i.category.toLowerCase()))];

    const relatedProducts = await Product.find({
      id: { $nin: cartIds },
      category: { $in: categories }
    });

    if (!relatedProducts.length) {
      return { success: true, recommendations: [], explanation: 'No products in same category', timestamp: new Date() };
    }

    const healthFiltered = await healthFilterService.filterProductsByHealth(
      userId,
      relatedProducts.map(p => p.id)
    );

    if (!healthFiltered.length) {
      return { success: true, recommendations: [], explanation: 'No healthy products found', timestamp: new Date() };
    }

    const budgetFiltered = await budgetService.filterProductsByBudget(userId, healthFiltered);
    if (!budgetFiltered.length) {
      return { success: true, recommendations: [], explanation: 'No products matched budget', timestamp: new Date() };
    }

    const cartProducts = await Product.find({ id: { $in: cartIds } });

    const { recommendations, explanation, metrics } =
      await recommendationService.getCartBasedRecommendations(userId, cartProducts, budgetFiltered);

    return {
      success: true,
      recommendations,
      explanation,
      metrics,
      timestamp: new Date()
    };
  } catch (error) {
    logger.error('Error in getCartRecommendations:', error.message);
    return {
      success: false,
      recommendations: [],
      error: 'Failed to generate recommendations'
    };
  }
}

module.exports = {
  addToCart,
  getCartRecommendations
};
