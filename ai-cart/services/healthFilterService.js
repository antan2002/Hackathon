const Product = require('../models/Product');
const Cache = require('../models/cache');
const { genAI, healthConditionPrompt } = require('../config/llm');
const logger = require('../utils/logger');
const User = require('../models/User');

const CACHE_DURATION = 3600; // 1 hour

async function getHarmfulIngredients(healthConditions = []) {
  const cacheKey = `harmful_ingredients_${healthConditions.sort().join('_')}`;

  try {
    const cached = await Cache.findOne({ key: cacheKey });
    if (cached) {
      logger.debug('Returning harmful ingredients from cache');
      return cached.value;
    }

    const allIngredients = await Product.distinct('ingredients');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = healthConditionPrompt(healthConditions, allIngredients);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let cleanText = response.text().trim();

    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/```$/, '').trim();
    }

    const harmfulIngredients = JSON.parse(cleanText);
    await Cache.create({
      key: cacheKey,
      value: harmfulIngredients,
      expiresAt: new Date(Date.now() + CACHE_DURATION * 1000)
    });

    return harmfulIngredients;
  } catch (error) {
    logger.error('Error in getHarmfulIngredients:', error.message);
    return [];
  }
}

async function filterProductsByHealth(userId, productIds) {
  try {
    const user = await User.findById(userId).select('healthConditions');
    if (!user) throw new Error('User not found');

    const harmfulIngredients = await getHarmfulIngredients(user.healthConditions || []);
    if (!harmfulIngredients.length) return productIds;

    const safeProducts = await Product.find({
      id: { $in: productIds },
      ingredients: { $not: { $elemMatch: { $in: harmfulIngredients } } }
    }).select('id');

    return safeProducts.map(p => p.id);
  } catch (error) {
    logger.error('Error in filterProductsByHealth:', error.message);
    return productIds;
  }
}

module.exports = {
  getHarmfulIngredients,
  filterProductsByHealth
};
