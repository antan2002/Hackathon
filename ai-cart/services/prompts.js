// LLM prompt templates for recommendationService

module.exports = {
  avoidIngredientsPrompt: (healthConditions, allIngredients) =>
    `User health conditions: ${healthConditions.join(", ") || "None"
    }\n\nIngredients list: ${allIngredients.join(
      ", "
    )}\n\nList the most important ingredients from the above that should be STRICTLY AVOIDED (near zero intake) for these health conditions. Return as a JSON array of ingredient names only. ONLY return the ingrediants that are STRICTLY PROHIBITED for the given Health conditions`,

  nutritionRangesPrompt: (healthConditions, nutritionKeys) =>
    `User health conditions: ${healthConditions.join(", ") || "None"
    }\n\nNutrition fields: ${nutritionKeys.join(
      ", "
    )}\n\nFor these health conditions, what are the preferred ranges or max/min values for these nutrients? Return as a JSON object: { nutrient: { min: value, max: value } }`,

  recommendationPrompt: (
    healthConditions,
    prevOrders,
    cart,
    filteredProducts
  ) =>
    `User health conditions: ${healthConditions.join(", ") || "None"
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
    )}\n\nRecommend the best 3 products for the user from the filtered products. Return as a JSON array of product IDs, and for each, a short reasoning. The recommended products MUST be from the list of Filtered products`,
};
