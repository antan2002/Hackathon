const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const healthConditionPrompt = (healthConditions, ingredients) => `
Analyze the following health conditions: ${healthConditions.join(', ')}.
Identify which of these ingredients might be harmful: ${ingredients.join(', ')}.
Return ONLY a JSON array of harmful ingredients, or an empty array if none are harmful.
Example: ["salt", "sugar"]
`;

const recommendationPrompt = (userProfile, products) => `
User Profile:
- Age: ${userProfile.age}
- Health Conditions: ${userProfile.healthConditions.join(', ')}
- Past Ordered Products: ${userProfile.previousOrders.map(p => p.name).join(', ')}

Products to consider (id, name, price, ingredients):
${products.map(p => `${p.id}: ${p.name} ($${p.price}) - ${p.ingredients.join(', ')}`).join('\n')}

Recommend 3 products that:
1. Avoid ingredients harmful to user's health conditions
2. Fit the user's typical budget range
3. Match preferences from past orders
4. Provide best nutritional value for user's age and conditions

Return ONLY a JSON array of product IDs in order of recommendation priority.
Example: ["p123", "p456", "p789"]
`;

module.exports = {
  genAI,
  healthConditionPrompt,
  recommendationPrompt
};