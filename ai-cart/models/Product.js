const mongoose = require('mongoose');

const nutritionInfoSchema = new mongoose.Schema({
  calories: Number,
  protein: Number,
  fiber: Number,
  sugar: Number,
  sodium: Number,
  fat: Number
});

const specificationSchema = new mongoose.Schema({
  quantity: Number,
  unit: String,
  brand: String,
  nutritionInfo: nutritionInfoSchema,
  organic: Boolean,
  storageInstructions: String
});

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  ingredients: { type: [String], required: true },
  price: { type: Number, required: true },
  specifications: specificationSchema,
  popularityScore: { type: Number, default: 0 }
}, { timestamps: true });

// Create indexes for faster queries
productSchema.index({ category: 1 });
productSchema.index({ ingredients: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'specifications.nutritionInfo.sugar': 1 });
productSchema.index({ 'specifications.nutritionInfo.sodium': 1 });

module.exports = mongoose.model('Product', productSchema);