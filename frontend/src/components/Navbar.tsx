import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getCartItemCount } = useCart();
  const { state: wishlistState } = useWishlist();
  const navigate = useNavigate();

  const categories = [
    'Electronics',
    'Clothing & Shoes',
    'Food & Beverages',
    'Home & Kitchen',
    'Household Essentials',
    'Sports & Outdoors',
    'Health & Beauty',
    'Toys & Games'
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (!query) return; // Don't proceed if search is empty

    try {
      setSearchQuery('');
      // 1. First try searching via API
      const response = await fetch(`http://localhost:5000/api/products/search?query=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();

      // 2. If we get results, navigate to products page with the search term
      if (data.length > 0) {
        const currentPath = window.location.pathname;

        if (currentPath.startsWith('/category/')) {
          const category = currentPath.split('/')[2];
          navigate(`/products?category=${encodeURIComponent(category)}&search=${encodeURIComponent(query)}`);
        } else {
          navigate(`/products?search=${encodeURIComponent(query)}`);
        }
      } else {
        // 3. If no results, show message or navigate to empty results page
        navigate(`/products?search=${encodeURIComponent(query)}&noresults=true`);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to client-side navigation if API fails
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="bg-[#0071ce] text-white sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-[#004c91] py-1">
        <div className="max-w-7xl mx-auto px-4 text-xs flex justify-between items-center">
          <span>Free shipping on orders $35+</span>
          <div className="flex items-center space-x-4">
            <span>Customer Service</span>
            <span>Help</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <img src="./download.png" alt="Walmart Logo" className="h-20 w-auto" />
            </div>
            <span className="font-bold text-xl hidden sm:block">Walmart</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search everything at Walmart online and in store"
                className="w-full px-4 py-2 pl-4 pr-12 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ffc220]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#ffc220] text-[#0071ce] p-2 rounded-full hover:bg-yellow-300 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Link
              to="/account"
              className="flex items-center space-x-1 hover:text-[#ffc220] transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="hidden md:block">Account</span>
            </Link>

            <Link
              to="/wishlist"
              className="flex items-center space-x-1 hover:text-[#ffc220] transition-colors relative"
            >
              <Heart className="w-5 h-5" />
              <span className="hidden md:block">Wishlist</span>
              {wishlistState.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#ffc220] text-[#0071ce] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {wishlistState.items.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="flex items-center space-x-1 hover:text-[#ffc220] transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden md:block">Cart</span>
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#ffc220] text-[#0071ce] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {getCartItemCount()}
                </span>
              )}
            </Link>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Categories bar */}
        <div className="hidden md:flex items-center py-2 border-t border-[#004c91]">
          <div className="flex items-center space-x-6">
            <Link
              to="/food"
              className="text-sm hover:text-[#ffc220] transition-colors whitespace-nowrap font-semibold"
            >
              🛒 Groceries
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="text-sm hover:text-[#ffc220] transition-colors whitespace-nowrap"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#004c91] py-4">
            <Link
              to="/food"
              className="block py-2 hover:text-[#ffc220] transition-colors font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              🛒 Groceries
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="block py-2 hover:text-[#ffc220] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {category}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;