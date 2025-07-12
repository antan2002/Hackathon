const { z } = require("zod");

// Schema for each LLM recommended product entry
const LLMProductSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    price: z.number().positive(),
    sodium: z.string().regex(/^\d+(.\d+)?mg$/, { message: "Sodium must be in 'mg' format" }),
    sugar: z.string().regex(/^\d+(.\d+)?g$/, { message: "Sugar must be in 'g' format" }),
    reasoning: z.string().min(1)
});

// Schema for full LLM JSON array
const LLMResponseSchema = z.array(LLMProductSchema);

// Nutrition metrics schema
const NutritionMetricSchema = z.object({
    id: z.string().min(1),
    healthIndex: z.number().int(),
    valueScore: z.number().nonnegative()
});

module.exports = {
    LLMResponseSchema,
    LLMProductSchema,
    NutritionMetricSchema
};