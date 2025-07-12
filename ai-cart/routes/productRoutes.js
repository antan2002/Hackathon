const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProductId } = require('../utils/helpers');


// Search products
router.get('/search', async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice } = req.query;
    const filters = {};

    if (query) filters.name = new RegExp(query, 'i');
    if (category) filters.category = category;
    if (minPrice) filters.price = { $gte: parseFloat(minPrice) };
    if (maxPrice) {
      filters.price = filters.price || {};
      filters.price.$lte = parseFloat(maxPrice);
    }

    const products = await productController.searchProducts(filters);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const products = await productController.getProductsByCategory(
      category,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get products' });
  }
});
// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await productController.searchProducts({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Get product by ID (now properly routed)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateProductId(id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const product = await productController.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get product' });
  }
});


module.exports = router;