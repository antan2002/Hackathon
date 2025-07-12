const mongoose = require('mongoose');
const Product = require('../models/Product');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const categories = await Product.distinct('category');
    console.log("Categories in DB:", categories);
    process.exit(0);
}

run();
mongoose.connection.on('error', (err) => {
    console.error(' MongoDB connection error:', err);
});