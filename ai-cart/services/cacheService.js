
const Cache = require('../models/cache');

async function getFromCache(key) {
    const cached = await Cache.findOne({ key });
    return cached?.value || null;
}

async function saveToCache(key, value, ttlSeconds = 1800) {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await Cache.updateOne(
        { key },
        { $set: { value, expiresAt } },
        { upsert: true }
    );
}

module.exports = {
    getFromCache,
    saveToCache
};
