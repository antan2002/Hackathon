const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productId: String,
  name: String,
  category: String,
  price: Number,
  nutritionInfo: {
    calories: Number,
    protein: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  },
  purchasedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  healthConditions: { type: [String], required: true },
  dietaryPreferences: { type: [String], default: [] },
  previousOrders: [orderSchema],
  averageOrderValue: { type: Number, default: 0 },
  lastOrderValue: { type: Number, default: 0 }
}, { timestamps: true });

// Create indexes
userSchema.index({ healthConditions: 1 });
userSchema.index({ 'previousOrders.productId': 1 });

module.exports = mongoose.model('User', userSchema);