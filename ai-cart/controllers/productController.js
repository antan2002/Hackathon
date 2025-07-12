const Product = require('../models/Product');

async function getProductById(id) {
    return await Product.findOne({ id });
}

async function searchProducts(filters) {
    return await Product.find(filters).limit(50); // Optional: add pagination
}

async function getProductsByCategory(category, limit = 20, offset = 0) {
    return await Product.find({ category })
        .skip(offset)
        .limit(limit);
}

module.exports = {
    getProductById,
    searchProducts,
    getProductsByCategory
};
