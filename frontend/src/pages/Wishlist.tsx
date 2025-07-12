import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlist, WishlistItem } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Wishlist: React.FC = () => {
  const { state: wishlistState, removeFromWishlist } = useWishlist(); // Updated to use the new method
  const { addToCart } = useCart();

  const handleRemoveFromWishlist = (id: string) => { // Changed to string
    const result = removeFromWishlist(id);
    if (!result.success) {
      console.warn(result.message);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    const result = addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      quantity: 1,
      maxQuantity: 99,
    });

    if (!result.success) {
      alert(result.message);
    }
  };

  if (wishlistState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Heart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h1>
          <p className="text-gray-600 mb-8">Save items you love for later by clicking the heart icon.</p>
          <Link
            to="/products"
            className="bg-[#0071ce] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist ({wishlistState.items.length} items)</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistState.items.map((item: WishlistItem) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <Link to={`/product/${item.id}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </Link>
                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-500 mb-1">{item.brand}</p>
                <Link to={`/product/${item.id}`}>
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-[#0071ce] transition-colors">
                    {item.title}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-[#0071ce] text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
                  aria-label="Add to cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/products" className="text-[#0071ce] hover:underline font-semibold">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;