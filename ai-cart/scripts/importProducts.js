const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Models
const Product = require('../models/Product');
const User = require('../models/User');
const Cache = require('../models/cache');

// Load product data from JSON
const productDataPath = path.join(__dirname, '../data/products.json');
const rawProductData = fs.readFileSync(productDataPath, 'utf-8');
const { categories } = JSON.parse(rawProductData);

// Flatten product data with category added
const allProducts = categories.flatMap(category =>
  category.products.map(product => ({
    ...product,
    category: category.name.toLowerCase(),
  }))
);

// Sample user data
const users = [
  {
    name: 'Anita Sharma',
    age: 50,
    healthConditions: ['hypertension'],
    previousOrders: [
      {
        productId: 'p00005',
        name: 'Natural Orange Juice',
        category: 'Vegetables',
        price: 6.61,
        nutritionInfo: {
          calories: 74,
          protein: 20.0,
          fiber: 8.9,
          sugar: 20.7
        },
        purchasedAt: new Date('2024-05-15')
      },
      {
        productId: 'p00003',
        name: 'Organic Bell Pepper',
        category: 'Vegetables',
        price: 11.02,
        nutritionInfo: {
          calories: 73,
          protein: 7.4,
          fiber: 7.3,
          sugar: 0.4
        },
        purchasedAt: new Date('2024-06-20')
      }
    ]
  }
];

// Product Import
async function importProducts() {
  console.log('Importing products...');
  await Product.deleteMany({});
  console.log('Cleared old products');

  const batchSize = 100;
  for (let i = 0; i < allProducts.length; i += batchSize) {
    const batch = allProducts.slice(i, i + batchSize).map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      ingredients: product.ingredients,
      price: product.price,
      specifications: {
        quantity: product.specifications.quantity,
        unit: product.specifications.unit,
        brand: product.specifications.brand,
        nutritionInfo: {
          calories: product.specifications.nutritionInfo.calories,
          protein: product.specifications.nutritionInfo.protein,
          fiber: product.specifications.nutritionInfo.fiber,
          sugar: product.specifications.nutritionInfo.sugar,
          sodium: product.specifications.nutritionInfo.sodium || 0,
          fat: product.specifications.nutritionInfo.fat || 0
        },
        organic: product.specifications.organic,
        storageInstructions: product.specifications.storageInstructions
      }
    }));

    await Product.insertMany(batch);
    console.log(` Imported batch ${i / batchSize + 1}`);
  }

  console.log(' All products imported');
}

// User Import
async function importUsers() {
  console.log(' Importing users...');
  await User.deleteMany({});
  console.log('Cleared old users');

  const formattedUsers = users.map(user => ({
    name: user.name,
    age: user.age,
    healthConditions: user.healthConditions,
    previousOrders: user.previousOrders.map(order => ({
      productId: order.productId,
      name: order.name,
      category: order.category,
      price: order.price,
      nutritionInfo: {
        calories: order.nutritionInfo.calories,
        protein: order.nutritionInfo.protein,
        fiber: order.nutritionInfo.fiber,
        sugar: order.nutritionInfo.sugar,
        sodium: order.nutritionInfo.sodium || 0
      },
      purchasedAt: order.purchasedAt
    })),
    averageOrderValue: user.previousOrders.reduce((sum, order) => sum + order.price, 0) / user.previousOrders.length,
    lastOrderValue: user.previousOrders[user.previousOrders.length - 1].price
  }));

  await User.insertMany(formattedUsers);
  console.log(' Users imported');
}

// Cache Cleanup
async function clearCache() {
  console.log('Clearing cache...');
  await Cache.deleteMany({});
  console.log(' Cache cleared');
}

// Run All
async function runImports() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' Connected to MongoDB');

    await importProducts();
    await importUsers();
    await clearCache();

    console.log('Import process complete');
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
}

runImports();
