"use strict";
const { genAI } = require("../config/llm");
const Product = require("../models/Product");
const User = require("../models/User");
const logger = require("../utils/logger");
const prompts = require("./prompts");

console.log("Recommendation service loaded");

async function getCategorySpecificRecommendations(userId, cartItems = []) {
  try {
    console.log("[Recommendation] Service started for user:", userId);
    const user = await User.findById(userId)
      .select("healthConditions averageOrderValue previousOrders")
      .lean();
    console.log("[Recommendation] User fetched:", user ? user._id : null);
    if (!user) throw new Error("User not found");

    // Get only products from categories present in cart items
    const cartCategorySet = new Set(
      cartItems.map((item) => item.category).filter(Boolean)
    );
    // Cart categories determined
    const allProducts = await Product.find({
      category: { $in: Array.from(cartCategorySet) },
    }).lean();
    // Products fetched for cart categories
    if (!allProducts.length)
      throw new Error("No products found for cart categories");

    // Create a unique list of all ingredients from these products
    const allIngredients = Array.from(
      new Set(
        allProducts.flatMap((p) =>
          Array.isArray(p.ingredients)
            ? p.ingredients.map((i) => i.toLowerCase())
            : []
        )
      )
    );
    // Unique ingredients list created

    // Use LLM to find 5-10 key ingredients to avoid for user's health
    const avoidPrompt = prompts.avoidIngredientsPrompt(
      user.healthConditions,
      allIngredients
    );
    // Avoid ingredients prompt created
    console.log("[Recommendation] Avoid ingredients prompt:", avoidPrompt);
    const avoidModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const avoidResult = await avoidModel.generateContent(avoidPrompt);
    const avoidText = (await avoidResult.response).text().trim();
    console.log("[Recommendation] LLM avoid ingredients response:", avoidText);
    let avoidIngredients = [];
    try {
      avoidIngredients = JSON.parse(
        avoidText.match(/\[.*\]/s)?.[0] || "[]"
      ).map((i) => i.toLowerCase());
      // Parsed avoid ingredients
      console.log(
        "[Recommendation] Parsed avoid ingredients:",
        avoidIngredients
      );
    } catch (e) {
      logger.error("Failed to parse avoidIngredients LLM response", avoidText);
    }
    if (!avoidIngredients.length)
      throw new Error("LLM did not return avoid ingredients");

    // Filter out products with those ingredients
    const productsNoAvoid = allProducts.filter(
      (p) =>
        !p.ingredients?.some((i) => avoidIngredients.includes(i.toLowerCase()))
    );
    // Products after avoid filter

    // SKIP nutrition filter step, use productsNoAvoid directly
    const productsForRecommendation = productsNoAvoid;
    // Using products after avoid filter

    // LLM call: Final recommendation based on user, previous orders, cart, and filtered products
    const prevOrders = user.previousOrders || [];
    const recPrompt = prompts.recommendationPrompt(
      user.healthConditions,
      prevOrders,
      cartItems,
      productsForRecommendation
    );
    console.log("[Recommendation] Recommendation prompt:", recPrompt);
    const recModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const recResult = await recModel.generateContent(recPrompt);
    const recText = (await recResult.response).text().trim();
    console.log("[Recommendation] LLM recommendation response:", recText);
    let recommendations = [];
    try {
      const parsed = JSON.parse(recText.match(/\[.*\]/s)?.[0] || "[]");
      recommendations = parsed.map((r) =>
        typeof r === "string"
          ? { id: r, explanation: "" }
          : { ...r, explanation: r.reasoning || r.explanation || "" }
      );
      // Parsed recommendations
      console.log(
        "[Recommendation] Parsed recommendations:",
        JSON.stringify(recommendations, null, 2)
      );
    } catch (e) {
      logger.error("Failed to parse recommendations LLM response", recText);
    }
    if (!recommendations.length)
      throw new Error("LLM did not return recommendations");

    // Fetch recommended product details
    const recommendedIds = recommendations.map((r) => r.id || r.productId);
    // Looking for recommended product IDs
    console.log("[Recommendation] Recommended product IDs:", recommendedIds);

    // Debug logging for ID matching
    // Product ID matching debug skipped

    // Attach explanation to each recommended product if available
    const recommendedProducts = productsForRecommendation
      .filter((p) => recommendedIds.includes(p.id))
      .map((p) => {
        const rec = recommendations.find((r) => (r.id || r.productId) === p.id);
        return rec ? { ...p, explanation: rec.explanation || "" } : p;
      });
    // Recommended products fetched
    console.log(
      "[Recommendation] Recommended products:",
      recommendedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        explanation: p.explanation,
      }))
    );

    // Generate nutrition metrics for recommended products
    const metrics = generateNutritionMetrics(recommendedProducts);
    // Nutrition metrics generated
    console.log("[Recommendation] Nutrition metrics:", metrics);

    return {
      recommendations: recommendedProducts,
      metrics,
      avoidIngredients,
    };
  } catch (error) {
    logger.error("LLM Recommendation failed:", error.message);
    console.log("[Error] LLM Recommendation failed:", error.message);
    return { recommendations: [], metrics: null, error: error.message };
  }
}

function generateNutritionMetrics(products) {
  return products.map((p) => {
    const n = p.specifications.nutritionInfo || {};
    const healthIndex = Math.round(
      (n.protein || 0) * 2 - (n.sugar || 0) * 0.5 - (n.sodium || 0) * 0.01
    );
    const valueScore = parseFloat(
      ((n.protein || 0) / (p.price || 1)).toFixed(2)
    );
    console.log(
      `Metrics for ${p.id}: HealthIndex=${healthIndex}, ValueScore=${valueScore}`
    );
    return {
      id: p.id,
      healthIndex,
      valueScore,
    };
  });
}

module.exports = {
  getCategorySpecificRecommendations,
  getCartBasedRecommendations: getCategorySpecificRecommendations,
};
