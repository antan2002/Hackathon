// 'use strict';
// const { genAI } = require('../config/llm');
// const Product = require('../models/Product');
// const User = require('../models/User');
// const Cache = require('../models/cache');
// const logger = require('../utils/logger');
// const { getHarmfulIngredients } = require('./healthFilterService');
// const { LLMResponseSchema, NutritionMetricSchema } = require('../models/zodSchemas');
// const { ZodError } = require('zod');
// const CACHE_DURATION = 1800; // 30 minutes

// console.log("Recommendation service loaded");

// async function getCategorySpecificRecommendations(userId, cartItemId) {
//   try {
//     console.log("Starting recommendation for user:", userId);

//     const user = await User.findById(userId).select('healthConditions averageOrderValue previousOrders').lean();
//     if (!user) throw new Error("User not found");
//     console.log("User data:", user);

//     let currentItem = Array.isArray(cartItemId) ? cartItemId[0] : cartItemId;

//     if (typeof currentItem === 'string') {
//       currentItem = await Product.findOne({ id: currentItem }).select('id name category ingredients specifications').lean();
//     }
//     if (!currentItem) throw new Error("Product not found");
//     console.log("Current item:", currentItem);

//     const category = typeof currentItem.category === 'string' ? currentItem.category.toLowerCase() : null;
//     if (!category) {
//       console.warn("Missing or invalid category:", currentItem);
//       return { recommendations: [], metrics: null };
//     }

//     const cacheKey = `recs:${userId}:${category}:${currentItem.id}`;
//     const cached = await Cache.findOne({ key: cacheKey });
//     if (cached?.recommendations?.length > 0) {
//       console.log("Returning cached recommendations for:", cacheKey);
//       return cached;
//     }

//     const categoryProducts = await Product.find({ category }).lean();
//     if (!categoryProducts.length) {
//       console.log("No products found in category:", category);
//       return { recommendations: [], metrics: null };
//     }
//     console.log("Found category products:", categoryProducts.length);

//     const { filtered, currentItemStatus } = await executeFilterPipeline(user, categoryProducts, currentItem.id, category);
//     console.log("Filtered products count:", filtered.length);

//     if (!filtered.length) return { recommendations: [], metrics: null, currentItemStatus };

//     const { ids: recommendedIds, explanation } = await getLLMRecommendations(user, filtered, category);
//     if (!Array.isArray(recommendedIds)) {
//       console.error("recommendedIds is not an array:", recommendedIds);
//       return { recommendations: [], metrics: null, explanation, currentItemStatus };
//     }

//     const recommendations = await Product.find({ id: { $in: recommendedIds } }).lean();
//     const metrics = generateNutritionMetrics(recommendations);
//     const validatedMetrics = metrics.map(m => NutritionMetricSchema.parse(m));
//     console.log("Zod validation passed for metrics:", validatedMetrics);

//     const result = {
//       recommendations,
//       metrics: validatedMetrics,
//       explanation,
//       currentItemStatus
//     };

//     await Cache.updateOne(
//       { key: cacheKey },
//       { $set: { ...result, expiresAt: new Date(Date.now() + CACHE_DURATION * 1000) } },
//       { upsert: true }
//     );

//     console.log("Final recommendations sent:", recommendations.map(p => p.id));
//     return result;
//   } catch (error) {
//     logger.error("Recommendation failed:", error.message);
//     if (error instanceof ZodError) {
//       console.error("Zod Validation Error:", error.errors);
//     }
//     return { recommendations: [], metrics: null, error: error.message };
//   }
// }

// async function executeFilterPipeline(user, products, cartItemId, category) {
//   const harmfulIngredients = (await getHarmfulIngredients(user.healthConditions))
//     .map(ing => ing.toLowerCase());
//   console.log("Normalized harmful ingredients:", harmfulIngredients);

//   const harmfulIngredientSet = new Set(harmfulIngredients);

//   const currentItem = products.find(p => p.id === cartItemId);
//   let currentItemStatus = null;

//   if (currentItem) {
//     const harmfulIngredientsFound = currentItem.ingredients
//       .map(ing => ing.toLowerCase())
//       .filter(ing => harmfulIngredientSet.has(ing));

//     currentItemStatus = {
//       id: currentItem.id,
//       status: harmfulIngredientsFound.length ? 'harmful' : 'healthy',
//       message: harmfulIngredientsFound.length
//         ? `Contains ingredients (${harmfulIngredientsFound.join(', ')}) that may worsen ${user.healthConditions.join(', ')}`
//         : 'This item meets your health requirements',
//       harmfulIngredients: harmfulIngredientsFound
//     };

//     console.log("Current item analysis:", JSON.stringify(currentItemStatus, null, 2));
//   }

//   const filteredProducts = products.filter(p =>
//     p.id === cartItemId ||
//     !p.ingredients.some(ing => harmfulIngredientSet.has(ing.toLowerCase()))
//   );

//   const budgetRange = calculateBudgetRange(user.averageOrderValue);
//   const budgetProducts = filteredProducts.filter(p =>
//     p.price >= budgetRange.min &&
//     p.price <= budgetRange.max
//   );

//   const historicalPurchaseIds = user.previousOrders
//     .filter(o => o.category === category)
//     .map(o => o.productId);

//   return {
//     filtered: budgetProducts
//       .sort((a, b) => {
//         const aScore = historicalPurchaseIds.includes(a.id) ? 1 : 0;
//         const bScore = historicalPurchaseIds.includes(b.id) ? 1 : 0;
//         return bScore - aScore || a.price - b.price;
//       })
//       .map(p => ({
//         ...p,
//         ...(p.id === cartItemId ? currentItemStatus : {})
//       })),
//     currentItemStatus
//   };
// }

// async function getLLMRecommendations(user, products, category) {
//   const prompt = buildLLMPrompt(user, products, category);
//   console.log("LLM prompt:\n", prompt);

//   const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text().trim();
//     console.log("LLM raw response:", text);

//     const jsonStart = text.indexOf("[");
//     const jsonEnd = text.lastIndexOf("]") + 1;
//     const jsonText = text.slice(jsonStart, jsonEnd);
//     const parsed = LLMResponseSchema.parse(JSON.parse(jsonText));
//     console.log("Zod validation passed for LLM response:", parsed);

//     const productMap = new Map(products.map(p => [p.id, p]));
//     const valid = parsed
//       .map(p => {
//         const product = productMap.get(p.id);
//         if (product) {
//           return {
//             ...product,
//             reasoning: p.reasoning || 'Recommended based on health and budget'
//           };
//         }
//         return null;
//       })
//       .filter(p => p !== null);

//     console.log("Parsed recommendations with details:", valid);

//     return {
//       ids: valid.map(p => p.id),
//       explanation: valid
//     };
//   } catch (err) {
//     logger.error("LLM fallback triggered:", err.message);
//     const fallback = products
//       .sort((a, b) => calculateHealthScore(b.specifications.nutritionInfo) - calculateHealthScore(a.specifications.nutritionInfo))
//       .slice(0, 3)
//       .map(p => p.id);

//     return {
//       ids: fallback,
//       explanation: fallback.map(id => {
//         const p = products.find(prod => prod.id === id);
//         const n = p?.specifications?.nutritionInfo || {};
//         return {
//           id: p?.id,
//           name: p?.name,
//           price: p?.price,
//           sodium: `${n.sodium}mg`,
//           sugar: `${n.sugar}g`,
//           protein: `${n.protein}g`,
//           reasoning: "High health index for your health conditions"
//         };
//       })
//     };
//   }
// }

// function buildLLMPrompt(user, products, category) {
//   return `User has the following health conditions: ${user.healthConditions.join(", ") || 'None'}.
// Their average budget is around $${user.averageOrderValue?.toFixed(2) || '10'}.

// Please analyze the following product candidates from the category "${category}" and select the top 3 most suitable products for the user’s health profile and budget.

// Return this JSON structure:
// [
//   {
//     "id": "p02527",
//     "name": "Organic Milk",
//     "price": 6.83,
//     "sodium": "11mg",
//     "sugar": "12.8g",
//     "reasoning": "Low sodium and budget-friendly, ideal for hypertension."
//   }
// ]

// Products to evaluate:
// ${products.map(p => {
//     const n = p.specifications?.nutritionInfo || {};
//     return `- ${p.id} - ${p.name || 'Unnamed'}: $${p.price}, sodium ${n.sodium ?? '?'}mg, sugar ${n.sugar ?? '?'}g`;
//   }).join("\n")}`;
// }

// function calculateBudgetRange(avg) {
//   return { min: avg * 0.7, max: avg * 1.3 };
// }

// function calculateHealthScore(n) {
//   return (n.protein || 0) * 2 - (n.sugar || 0) * 0.5 - (n.sodium || 0) * 0.01;
// }

// function generateNutritionMetrics(products) {
//   return products.map(p => {
//     const n = p.specifications.nutritionInfo || {};
//     const healthIndex = Math.round((n.protein || 0) * 2 - (n.sugar || 0) * 0.5 - (n.sodium || 0) * 0.01);
//     const valueScore = parseFloat(((n.protein || 0) / (p.price || 1)).toFixed(2));
//     console.log(`Metrics for ${p.id}: HealthIndex=${healthIndex}, ValueScore=${valueScore}`);
//     return {
//       id: p.id,
//       healthIndex,
//       valueScore
//     };
//   });
// }

// module.exports = {
//   getCategorySpecificRecommendations,
//   getCartBasedRecommendations: getCategorySpecificRecommendations
// };



'use strict';
const { genAI } = require('../config/llm');
const Product = require('../models/Product');
const User = require('../models/User');
const Cache = require('../models/cache');
const logger = require('../utils/logger');
const { getHarmfulIngredients } = require('./healthFilterService');
const { LLMResponseSchema, NutritionMetricSchema } = require('../models/zodSchemas');
const { ZodError } = require('zod');
const CACHE_DURATION = 1800; // 30 minutes

console.log("Recommendation service loaded");

async function getCategorySpecificRecommendations(userId, cartItemId) {
  let currentItemStatus = null;
  try {
    console.log("Starting recommendation for user:", userId);

    const user = await User.findById(userId).select('healthConditions averageOrderValue previousOrders').lean();
    if (!user) throw new Error("User not found");
    console.log("User data:", user);

    let currentItem = Array.isArray(cartItemId) ? cartItemId[0] : cartItemId;

    if (typeof currentItem === 'string') {
      currentItem = await Product.findOne({ id: currentItem }).select('id name category ingredients specifications').lean();
    }
    if (!currentItem) throw new Error("Product not found");
    console.log("Current item:", currentItem);

    const category = typeof currentItem.category === 'string' ? currentItem.category.toLowerCase() : null;
    if (!category) {
      console.warn("Missing or invalid category:", currentItem);
      return { recommendations: [], metrics: null, currentItemStatus: null };
    }

    const cacheKey = `recs:${userId}:${category}:${currentItem.id}`;
    const cached = await Cache.findOne({ key: cacheKey });
    if (cached?.recommendations?.length > 0) {
      console.log("Returning cached recommendations for:", cacheKey);
      return cached;
    }

    const categoryProducts = await Product.find({ category }).lean();
    if (!categoryProducts.length) {
      console.log("No products found in category:", category);
      return { recommendations: [], metrics: null, currentItemStatus: null };
    }
    console.log("Found category products:", categoryProducts.length);

    const filterResult = await executeFilterPipeline(user, categoryProducts, currentItem.id, category);
    const { filtered } = filterResult;
    currentItemStatus = filterResult.currentItemStatus;
    console.log("Filtered products count:", filtered.length);

    if (!filtered.length) return { recommendations: [], metrics: null, currentItemStatus };

    const { ids: recommendedIds, explanation } = await getLLMRecommendations(user, filtered, category);
    if (!Array.isArray(recommendedIds)) {
      console.error("recommendedIds is not an array:", recommendedIds);
      return { recommendations: [], metrics: null, explanation, currentItemStatus };
    }

    const recommendations = await Product.find({ id: { $in: recommendedIds } }).lean();
    const metrics = generateNutritionMetrics(recommendations);
    const validatedMetrics = metrics.map(m => NutritionMetricSchema.parse(m));
    console.log("Zod validation passed for metrics:", validatedMetrics);

    const result = {
      recommendations,
      metrics: validatedMetrics,
      explanation,
      currentItemStatus
    };

    await Cache.updateOne(
      { key: cacheKey },
      { $set: { ...result, expiresAt: new Date(Date.now() + CACHE_DURATION * 1000) } },
      { upsert: true }
    );

    console.log("Final recommendations sent:", recommendations.map(p => p.id));
    return result;
  } catch (error) {
    logger.error("Recommendation failed:", error.message);
    if (error instanceof ZodError) {
      console.error("Zod Validation Error:", error.errors);
    }
    return { recommendations: [], metrics: null, error: error.message, currentItemStatus };
  }
}

async function executeFilterPipeline(user, products, cartItemId, category) {
  const harmfulIngredients = (await getHarmfulIngredients(user.healthConditions))
    .map(ing => ing.toLowerCase());
  console.log("Normalized harmful ingredients:", harmfulIngredients);

  const harmfulIngredientSet = new Set(harmfulIngredients);

  const currentItem = products.find(p => p.id === cartItemId);
  let currentItemStatus = null;

  if (currentItem) {
    const harmfulIngredientsFound = currentItem.ingredients
      .map(ing => ing.toLowerCase())
      .filter(ing => harmfulIngredientSet.has(ing));

    currentItemStatus = {
      id: currentItem.id,
      status: harmfulIngredientsFound.length ? 'harmful' : 'healthy',
      message: harmfulIngredientsFound.length
        ? `Contains ingredients (${harmfulIngredientsFound.join(', ')}) that may worsen ${user.healthConditions.join(', ')}`
        : 'This item meets your health requirements',
      harmfulIngredients: harmfulIngredientsFound
    };

    console.log("Current item analysis:", JSON.stringify(currentItemStatus, null, 2));
  }

  const filteredProducts = products.filter(p =>
    p.id === cartItemId ||
    !p.ingredients.some(ing => harmfulIngredientSet.has(ing.toLowerCase()))
  );

  const budgetRange = calculateBudgetRange(user.averageOrderValue);
  const budgetProducts = filteredProducts.filter(p =>
    p.price >= budgetRange.min &&
    p.price <= budgetRange.max
  );

  const historicalPurchaseIds = user.previousOrders
    .filter(o => o.category === category)
    .map(o => o.productId);

  return {
    filtered: budgetProducts
      .sort((a, b) => {
        const aScore = historicalPurchaseIds.includes(a.id) ? 1 : 0;
        const bScore = historicalPurchaseIds.includes(b.id) ? 1 : 0;
        return bScore - aScore || a.price - b.price;
      })
      .map(p => ({
        ...p,
        ...(p.id === cartItemId ? currentItemStatus : {})
      })),
    currentItemStatus
  };
}

async function getLLMRecommendations(user, products, category) {
  const prompt = buildLLMPrompt(user, products, category);
  console.log("LLM prompt:\n", prompt);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    console.log("LLM raw response:", text);

    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;
    const jsonText = text.slice(jsonStart, jsonEnd);
    const parsed = LLMResponseSchema.parse(JSON.parse(jsonText));
    console.log("Zod validation passed for LLM response:", parsed);

    const productMap = new Map(products.map(p => [p.id, p]));
    const valid = parsed
      .map(p => {
        const product = productMap.get(p.id);
        if (product) {
          return {
            ...product,
            reasoning: p.reasoning || 'Recommended based on health and budget'
          };
        }
        return null;
      })
      .filter(p => p !== null);

    console.log("Parsed recommendations with details:", valid);

    return {
      ids: valid.map(p => p.id),
      explanation: valid
    };
  } catch (err) {
    logger.error("LLM fallback triggered:", err.message);
    const fallback = products
      .sort((a, b) => calculateHealthScore(b.specifications.nutritionInfo) - calculateHealthScore(a.specifications.nutritionInfo))
      .slice(0, 3)
      .map(p => p.id);

    return {
      ids: fallback,
      explanation: fallback.map(id => {
        const p = products.find(prod => prod.id === id);
        const n = p?.specifications?.nutritionInfo || {};
        return {
          id: p?.id,
          name: p?.name,
          price: p?.price,
          sodium: `${n.sodium}mg`,
          sugar: `${n.sugar}g`,
          protein: `${n.protein}g`,
          reasoning: "High health index for your health conditions"
        };
      })
    };
  }
}

function buildLLMPrompt(user, products, category) {
  return `User has the following health conditions: ${user.healthConditions.join(", ") || 'None'}.
Their average budget is around $${user.averageOrderValue?.toFixed(2) || '10'}.

Please analyze the following product candidates from the category "${category}" and select the top 3 most suitable products for the user’s health profile and budget.

Return this JSON structure:
[
  {
    "id": "p02527",
    "name": "Organic Milk",
    "price": 6.83,
    "sodium": "11mg",
    "sugar": "12.8g",
    "reasoning": "Low sodium and budget-friendly, ideal for hypertension."
  }
]

Products to evaluate:
${products.map(p => {
    const n = p.specifications?.nutritionInfo || {};
    return `- ${p.id} - ${p.name || 'Unnamed'}: $${p.price}, sodium ${n.sodium ?? '?'}mg, sugar ${n.sugar ?? '?'}g`;
  }).join("\n")}`;
}

function calculateBudgetRange(avg) {
  return { min: avg * 0.7, max: avg * 1.3 };
}

function calculateHealthScore(n) {
  return (n.protein || 0) * 2 - (n.sugar || 0) * 0.5 - (n.sodium || 0) * 0.01;
}

function generateNutritionMetrics(products) {
  return products.map(p => {
    const n = p.specifications.nutritionInfo || {};
    const healthIndex = Math.round((n.protein || 0) * 2 - (n.sugar || 0) * 0.5 - (n.sodium || 0) * 0.01);
    const valueScore = parseFloat(((n.protein || 0) / (p.price || 1)).toFixed(2));
    console.log(`Metrics for ${p.id}: HealthIndex=${healthIndex}, ValueScore=${valueScore}`);
    return {
      id: p.id,
      healthIndex,
      valueScore
    };
  });
}

module.exports = {
  getCategorySpecificRecommendations,
  getCartBasedRecommendations: getCategorySpecificRecommendations
};
