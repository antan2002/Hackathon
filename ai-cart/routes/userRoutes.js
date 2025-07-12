const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create new user
router.post('/', async (req, res) => {
  try {
    const { name, age, healthConditions } = req.body;

    if (!name || !age || !healthConditions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await userController.createUser({
      name,
      age,
      healthConditions
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await userController.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user preferences
router.patch('/preferences', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await userController.updateUserPreferences(
      req.user.id,
      updates
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get user order history
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await userController.getOrderHistory(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get order history' });
  }
});

module.exports = router;