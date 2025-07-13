// LLM prompt templates for recommendationService

module.exports = {
  avoidIngredientsPrompt: (healthConditions, allIngredients) =>
    `User health conditions: ${
      healthConditions.join(", ") || "None"
    }\n\nIngredients list: ${allIngredients.join(
      ", "
    )}\n\nList the 5-10 most important ingredients from the above that should be strictly avoided (near zero intake) for these health conditions. Return as a JSON array of ingredient names only.`,

  nutritionRangesPrompt: (healthConditions, nutritionKeys) =>
    `User health conditions: ${
      healthConditions.join(", ") || "None"
    }\n\nNutrition fields: ${nutritionKeys.join(
      ", "
    )}\n\nFor these health conditions, what are the preferred ranges or max/min values for these nutrients? Return as a JSON object: { nutrient: { min: value, max: value } }`,

  recommendationPrompt: (
    healthConditions,
    prevOrders,
    cart,
    filteredProducts
  ) =>
    `User health conditions: ${
      healthConditions.join(", ") || "None"
    }\nPrevious orders: ${JSON.stringify(
      prevOrders
    )}\nCurrent cart: ${JSON.stringify(
      cart
    )}\nFiltered products: ${JSON.stringify(
      filteredProducts.map((p) => ({
        id: p.id,
        name: p.name,
        nutrition: p.specifications?.nutritionInfo,
      }))
    )}\n\nRecommend the best 5-10 products for the user. Return as a JSON array of product IDs, and for each, a short reasoning.`,
};
