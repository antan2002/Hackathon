const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { validateProductId } = require('../utils/helpers');
const authMiddleware = require('../middlewares/authMiddleware');

// Add item to cart
// router.post('/add', authMiddleware, async (req, res) => {
//   try {
//     const { productId } = req.body;

//     if (!validateProductId(productId)) {
//       return res.status(400).json({ error: 'Invalid product ID format' });
//     }

//     const result = await cartController.addToCart(req.user.id, productId);
//     if (!result.success) {
//       return res.status(400).json({ 
//         error: result.message,
//         harmfulIngredients: result.harmfulIngredients 
//       });
//     }

//     res.json({ 
//       success: true,
//       product: result.product,
//       message: 'Item added to cart successfully'
//     });
//   } catch (error) {
//     console.error('Error adding to cart:', error);
//     res.status(500).json({ 
//       error: 'Failed to add item to cart',
//       details: error.message 
//     });
//   }
// });

router.post('/add', async (req, res) => {
  try {
    const { productId } = req.body;

    // TEMP: Hardcoded User ID for testing (Anita Sharma)
    req.user = { id: '6871270fc6acd2d67a46e7a9' };

    if (!validateProductId(productId)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const result = await cartController.addToCart(req.user.id, productId);
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


// Get recommendations based on current cart contents
// router.post('/recommendations', authMiddleware, async (req, res) => {
//   try {
//     const { cartItems } = req.body;

//     if (!Array.isArray(cartItems)) {
//       return res.status(400).json({ error: 'cartItems must be an array' });
//     }

//     // Validate each cart item has required fields
//     const invalidItems = cartItems.filter(item =>
//       !item.id || !item.category || !item.ingredients
//     );

//     if (invalidItems.length > 0) {
//       return res.status(400).json({
//         error: 'Each cart item must contain id, category, and ingredients'
//       });
//     }

//     const recommendations = await cartController.getCartRecommendations(
//       req.user.id,
//       cartItems
//     );

//     res.json({
//       success: true,
//       recommendations,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Recommendation error:', error);
//     res.status(500).json({
//       error: 'Failed to generate recommendations',
//       details: error.message
//     });
//   }
// });
router.post('/recommendations', async (req, res) => {
  req.user = { id: '6871270fc6acd2d67a46e7a9' }; // 🔐 Anita Sharma (Hardcoded User ID)

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