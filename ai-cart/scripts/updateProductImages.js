const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Models
const Product = require('../models/Product');

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://www.searchapi.io/api/v1/search';

async function searchImage(productName) {
    try {
        const response = await axios.get(UNSPLASH_API_URL, {
            params: {
                q: productName,
                engine: "google_images",
                page: 1,
                aspect_ratio: 'square',
            },
            headers: {
                Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });
        // console.log(response);
        if (response.data.images && response.data.images.length > 0) {
            return response.data.images[0].thumbnail; // Use thumbnail for better performance
        }
        return null;
    } catch (error) {
        console.error(`Error searching image for ${productName}:`, error.message);
        return null;
    }
}

async function updateProductImages() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get all products
        const products = await Product.find({});
        console.log(`Found ${products.length} products to process`);

        // Process products with delay to respect API rate limits
        for (const product of products) {
            if (product.imageUrl.includes('example.com/images/')) {
                console.log(`Searching image for: ${product.name}`);

                const imageUrl = await searchImage(product.name);

                if (imageUrl) {
                    product.imageUrl = imageUrl;
                    await product.save();
                    console.log(`Updated image for: ${product.name}`);
                } else {
                    console.log(`No image found for: ${product.name}`);
                }

                // Add delay to respect API rate limits (10 requests per minute for demo account)
                await new Promise(resolve => setTimeout(resolve, 6000));
            } else {
                console.log(`Skipping product with existing image: ${product.name}`);
            }
        }

        console.log('Image update process complete');
        process.exit(0);
    } catch (error) {
        console.error('Error updating product images:', error);
        process.exit(1);
    }
}

updateProductImages();
// searchImage('Fresh Organic Carrots'); // Example usage, replace with actual product name
