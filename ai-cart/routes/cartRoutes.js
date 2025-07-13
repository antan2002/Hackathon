const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { validateProductId } = require('../utils/helpers');
const authMiddleware = require('../middlewares/authMiddleware');
router.post('/add', async (req, res) => {
  try {
    const { productId } = req.body;

    // TEMP: Hardcoded User ID for testing (Anita Sharma)
    req.user = { id: '6873b2c293e7ada8c58dac89' };

    if (!validateProductId(productId)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const result = await cartController.addToCart(req.user.id, productId);
    console.log('Add to cart result:', result);
    if (!result.success) {
      return res.status(400).json({
        error: result.message,
        harmfulIngredients: result.harmfulIngredients
      });
    }

    res.json({
      success: true,
      product: result.product,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      error: 'Failed to add item to cart',
      details: error.message
    });
  }
});

router.post('/recommendations', async (req, res) => {
  req.user = { id: '6873b2c293e7ada8c58dac89' }; // 🔐 Anita Sharma (Hardcoded User ID)

  try {
    const { cartItems } = req.body;

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ error: 'cartItems must be an array' });
    }

    const invalidItems = cartItems.filter(item =>
      !item.id || !item.category || !item.ingredients
    );

    if (invalidItems.length > 0) {
      return res.status(400).json({
        error: 'Each cart item must contain id, category, and ingredients'
      });
    }

    const recommendations = await cartController.getCartRecommendations(
      req.user.id,
      cartItems
    );

    res.json({
      success: true,
      recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      error: 'Failed to generate recommendations',
      details: error.message
    });
  }
});

// Remove batch recommendations endpoint since we're focusing on cart-based suggestions

module.exports = router;