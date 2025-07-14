const Product = require("../models/Product");
const User = require("../models/User");
const healthFilterService = require("../services/healthFilterService");
const budgetService = require("../services/budgetService");
const recommendationService = require("../services/recommendationService");
const logger = require("../utils/logger");

async function addToCart(userId, productId) {
  try {
    const product = await Product.findOne({ id: productId });
    if (!product) throw new Error("Product not found");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const harmfulIngredients = await healthFilterService.getHarmfulIngredients(
      user.healthConditions || []
    );
    const hasHarmful = product.ingredients.some((i) =>
      harmfulIngredients.includes(i.toLowerCase())
    );

    if (hasHarmful) {
      return {
        success: false,
        message: `This product contains ingredients that may not be suitable for your health conditions: ${user.healthConditions.join(
          ", "
        )}`,
        harmfulIngredients: product.ingredients.filter((i) =>
          harmfulIngredients.includes(i.toLowerCase())
        ),
      };
    }

    return { success: true, product };
  } catch (error) {
    logger.error("Error in addToCart:", error.message);
    return { success: false, error: "Failed to add product to cart" };
  }
}

async function getCartRecommendations(userId, cartItems) {
  try {
    const inputLog = `[getCartRecommendations] userId=${userId}, cartItems=${JSON.stringify(
      cartItems
    )}`;
    logger.info(inputLog);
    console.log(inputLog);
    if (!Array.isArray(cartItems)) {
      logger.warn("[getCartRecommendations] cartItems is not an array");
      console.warn("[getCartRecommendations] cartItems is not an array");
      return { success: false, error: "cartItems must be an array" };
    }

    // Optionally validate cartItems structure here if needed
    logger.info(
      "[getCartRecommendations] Calling recommendationService.getCartBasedRecommendations"
    );
    console.log(
      "[getCartRecommendations] Calling recommendationService.getCartBasedRecommendations"
    );
    const { recommendations, metrics, error } =
      await recommendationService.getCartBasedRecommendations(
        userId,
        cartItems
      );

    if (error) {
      logger.error(`[getCartRecommendations] LLM error: ${error}`);
      console.error(`[getCartRecommendations] LLM error: ${error}`);
      return {
        success: false,
        recommendations: [],
        error,
      };
    }

    const successLog = `[getCartRecommendations] Success. Recommendations: ${JSON.stringify(
      recommendations.map((r) => r.id || r)
    )}`;
    logger.info(successLog);
    console.log(successLog);
    return {
      success: true,
      recommendations,
      metrics,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error("Error in getCartRecommendations:", error.message);
    return {
      success: false,
      recommendations: [],
      error: "Failed to generate recommendations",
    };
  }
}

module.exports = {
  addToCart,
  getCartRecommendations,
};
