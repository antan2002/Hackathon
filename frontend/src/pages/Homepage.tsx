import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, Shield, RefreshCw, HeadphonesIcon } from 'lucide-react';
import ProductCard from '../components/ProductCard';

interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockQuantity?: number;
  unit?: string;
  expiryInfo?: string;
  refrigerated?: boolean;
  frozen?: boolean;
}

const Homepage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products/featured');
        const data = await res.json();
        const mapped = data.slice(0, 4).map((p: any) => ({
          id: p.id,
          title: p.name,
          brand: p.specifications?.brand || 'Unknown',
          price: p.price,
          originalPrice: p.originalPrice || undefined,
          image: p.image || '/placeholder.png',
          rating: p.rating || 4,
          reviews: p.reviews || 100,
          inStock: true,
          stockQuantity: p.specifications?.quantity || 10,
          unit: `${p.specifications?.quantity || ''} ${p.specifications?.unit || ''}`,
          expiryInfo: p.specifications?.storageInstructions || '',
          refrigerated: p.specifications?.refrigerated || false,
          frozen: p.specifications?.frozen || false,
        }));
        setFeaturedProducts(mapped);
      } catch (error) {
        console.error('Failed to fetch featured products', error);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    {
      name: 'Electronics',
      image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg',
      description: 'Latest tech & gadgets'
    },
    {
      name: 'Food & Beverages',
      image: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg',
      description: 'Fresh groceries & snacks'
    },
    {
      name: 'Clothing & Shoes',
      image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg',
      description: 'Fashion for everyone'
    },
    {
      name: 'Home & Kitchen',
      image: 'https://images.pexels.com/photos/2082090/pexels-photo-2082090.jpeg',
      description: 'Make your house a home'
    },
  ];

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders $35 or more'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Protected checkout'
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '90-day return policy'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Always here to help'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0071ce] to-[#004c91] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Save Money.
                <br />
                Live Better.
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Discover amazing deals on everything you need, from groceries to electronics.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/products"
                  className="bg-[#ffc220] text-[#0071ce] px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors inline-flex items-center justify-center"
                >
                  Shop Now
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/deals"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#0071ce] transition-colors inline-flex items-center justify-center"
                >
                  View Deals
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg"
                alt="Shopping"
                className="w-full h-96 object-cover rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-[#0071ce] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link
              to="/products"
              className="text-[#0071ce] hover:text-blue-700 font-semibold flex items-center"
            >
              View All
              <ChevronRight className="ml-1 w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-[#ffc220] to-[#ffb800] rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0071ce] mb-4">
              Special Offers Just for You
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Sign up for our newsletter and get exclusive deals delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-[#0071ce]"
              />
              <button className="bg-[#0071ce] text-white px-8 py-3 rounded-r-lg sm:rounded-l-none hover:bg-blue-700 transition-colors font-semibold">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
