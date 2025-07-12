import React, { useState, useEffect } from 'react';
import { Grid, List, Apple, Coffee, Cookie, Beef } from 'lucide-react';
import FoodProductCard from '../components/FoodProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  subcategory: string;
  category: string;
  image?: string;
}

const FoodSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all',
    'Vegetables',
    'Fruits',
    'Dairy',
    'Beverages',
    'Snacks',
    'Grains',
    'Frozen Foods',
    'Canned Goods',
    'Bakery',
    'Meat',
  ];

  const categoryIcons: { [key: string]: any } = {
    Vegetables: Apple,
    Fruits: Apple,
    Beverages: Coffee,
    Snacks: Cookie,
    Meat: Beef,
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url =
          selectedCategory === 'all'
            ? 'http://localhost:5000/api/products'
            : `http://localhost:5000/api/products/category/${encodeURIComponent(
              selectedCategory.toLowerCase()
            )}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Invalid JSON response');

        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const filteredProducts = [...products];

  switch (sortBy) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredProducts.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      // assuming id is string but lexicographically can be sorted by parseInt
      filteredProducts.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      break;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="text-center max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Fresh Food & Beverages</h1>
          <p className="text-xl mb-8 text-green-100">Quality groceries delivered fresh to your door</p>
          <div className="flex justify-center space-x-4">
            <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg font-semibold">🚚 Same-day delivery</div>
            <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg font-semibold">🥬 Farm fresh produce</div>
            <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg font-semibold">❄️ Temperature controlled</div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => {
              const Icon = categoryIcons[category] || Apple;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${selectedCategory === category
                    ? 'bg-[#0071ce] text-white border-[#0071ce]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#0071ce] hover:text-[#0071ce]'
                    }`}
                >
                  {category !== 'all' && <Icon className="w-4 h-4" />}
                  <span className="capitalize">{category === 'all' ? 'All Categories' : category}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">
              {selectedCategory === 'all' ? 'All Food Products' : selectedCategory}
            </h3>
            <span className="text-gray-600">({filteredProducts.length} items)</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#0071ce] text-white' : 'text-gray-400'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#0071ce] text-white' : 'text-gray-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce]"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 mb-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">🛒 Fresh Deals Today!</h3>
          <p className="text-gray-800 mb-4">Save up to 30% on fresh produce and organic items</p>
          <div className="flex justify-center space-x-4 text-sm">
            <span className="bg-white bg-opacity-80 px-3 py-1 rounded-full">Free delivery on $35+</span>
            <span className="bg-white bg-opacity-80 px-3 py-1 rounded-full">Organic produce 20% off</span>
            <span className="bg-white bg-opacity-80 px-3 py-1 rounded-full">Buy 2 Get 1 Free snacks</span>
          </div>
        </div>

        <div>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No products found in this category</p>
              <button onClick={() => setSelectedCategory('all')} className="text-[#0071ce] hover:underline">
                View all food products
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
                }`}
            >
              {filteredProducts.map((product) => (
                <FoodProductCard
                  key={product.id}
                  product={{
                    id: product.id, // keep string id as is
                    title: product.name, // map name -> title
                    brand: 'Generic', // update if actual brand available
                    price: product.price,
                    rating: product.rating,
                    reviews: 0, // replace with actual if available
                    inStock: true, // replace with actual stock info if available
                    image: product.image ?? '',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodSection;
