"use strict";
const { genAI } = require("../config/llm");
const Product = require("../models/Product");
const User = require("../models/User");
const logger = require("../utils/logger");
const prompts = require("./prompts");

console.log("Recommendation service loaded");

async function getCategorySpecificRecommendations(userId, cartItems = []) {
  try {
    console.log(
      "[Step 1] Starting new LLM-driven recommendation for user:",
      userId
    );
    const user = await User.findById(userId)
      .select("healthConditions averageOrderValue previousOrders")
      .lean();
    console.log("[Step 2] User fetched:", user);
    if (!user) throw new Error("User not found");

    // Get only products from categories present in cart items
    const cartCategorySet = new Set(
      cartItems.map((item) => item.category).filter(Boolean)
    );
    console.log("Cart categories:", Array.from(cartCategorySet));
    const allProducts = await Product.find({
      category: { $in: Array.from(cartCategorySet) },
    }).lean();
    console.log(
      "Products fetched for cart categories. Count:",
      allProducts.length
    );
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
    console.log(
      "Unique ingredients list created. Count:",
      allIngredients.length
    );

    // Use LLM to find 5-10 key ingredients to avoid for user's health
    const avoidPrompt = prompts.avoidIngredientsPrompt(
      user.healthConditions,
      allIngredients
    );
    console.log("Avoid ingredients prompt:", avoidPrompt);
    const avoidModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const avoidResult = await avoidModel.generateContent(avoidPrompt);
    const avoidText = (await avoidResult.response).text().trim();
    console.log("LLM avoid ingredients response:", avoidText);
    let avoidIngredients = [];
    try {
      avoidIngredients = JSON.parse(
        avoidText.match(/\[.*\]/s)?.[0] || "[]"
      ).map((i) => i.toLowerCase());
      console.log("Parsed avoid ingredients:", avoidIngredients);
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
    console.log("Products after avoid filter. Count:", productsNoAvoid.length);

    // SKIP nutrition filter step, use productsNoAvoid directly
    const productsForRecommendation = productsNoAvoid;
    console.log(
      "Using products after avoid filter. Count:",
      productsForRecommendation.length
    );

    // LLM call: Final recommendation based on user, previous orders, cart, and filtered products
    const prevOrders = user.previousOrders || [];
    const recPrompt = prompts.recommendationPrompt(
      user.healthConditions,
      prevOrders,
      cartItems,
      productsForRecommendation
    );
    console.log("Recommendation prompt:", recPrompt);
    const recModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const recResult = await recModel.generateContent(recPrompt);
    const recText = (await recResult.response).text().trim();
    console.log("LLM recommendation response:", recText);
    let recommendations = [];
    let explanation = [];
    try {
      const parsed = JSON.parse(recText.match(/\[.*\]/s)?.[0] || "[]");
      recommendations = parsed.map((r) =>
        typeof r === "string" ? { id: r } : r
      );
      explanation = recommendations.map((r) => r.reasoning || "");
      console.log("Parsed recommendations:", JSON.stringify(recommendations, null, 2));
    } catch (e) {
      logger.error("Failed to parse recommendations LLM response", recText);
    }
    if (!recommendations.length)
      throw new Error("LLM did not return recommendations");

    // Fetch recommended product details
    const recommendedIds = recommendations.map((r) => r.id || r.productId);
    console.log("Looking for these product IDs:", recommendedIds);
    console.log("Available products:", productsForRecommendation.map(p => ({ id: p.id, name: p.name })));

    // Debug logging for ID matching
    productsForRecommendation.forEach(p => {
      console.log(`Checking product ${p.id} (${typeof p.id}):`,
        recommendedIds.includes(p.id),
        "Matches any?:", recommendedIds.some(rid => rid === p.id)
      );
    });

    const recommendedProducts = productsForRecommendation.filter((p) =>
      recommendedIds.includes(p.id)
    );
    console.log(
      "Recommended products fetched. Count:",
      recommendedProducts.length,
      "\nMatched products:",
      JSON.stringify(recommendedProducts.map(p => ({ id: p.id, name: p.name })), null, 2)
    );

    // Generate nutrition metrics for recommended products
    const metrics = generateNutritionMetrics(recommendedProducts);
    console.log("Nutrition metrics generated:", metrics);

    return {
      recommendations: recommendedProducts,
      metrics,
      explanation,
      avoidIngredients,
      // nutritionRanges is not used anymore, but kept for compatibility
      nutritionRanges: undefined,
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
