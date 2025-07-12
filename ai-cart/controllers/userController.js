const User = require('../models/User');

async function getUserById(id) {
    return await User.findById(id);
}

async function createUser(userData) {
    const user = new User(userData);
    return await user.save();
}

async function updateUserOrders(userId, newOrder) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.previousOrders.push(newOrder);

    // Update average order value
    const total = user.previousOrders.reduce((sum, order) => sum + order.price, 0);
    user.averageOrderValue = total / user.previousOrders.length;
    user.lastOrderValue = newOrder.price;

    return await user.save();
}

module.exports = {
    getUserById,
    createUser,
    updateUserOrders
};
