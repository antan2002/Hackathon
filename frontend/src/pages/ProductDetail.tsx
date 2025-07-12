import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Sparkles, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  ingredients?: string[];
}

interface Recommendation {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

const Cart: React.FC = () => {
  const { state, updateQuantity, removeFromCart, addToCart } = useCart();
  const [recommendations, setRecommendations] = useState<Record<string, Recommendation[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [fetchedItems, setFetchedItems] = useState<Set<string>>(new Set());

  const fetchRecommendations = useCallback(async (product: CartItem) => {
    const productId = product.id;

    // Skip if already fetched or currently loading
    if (fetchedItems.has(productId)) return;

    setLoading(prev => ({ ...prev, [productId]: true }));
    setError(null);

    try {
      const requestBody = {
        cartItems: [{
          id: productId,
          name: product.title,
          category: product.category || 'general',
          ingredients: product.ingredients || []
        }]
      };

      console.log('Sending request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('http://localhost:5000/api/cart/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with ${response.status}`);
      }

      const data = await response.json();

      if (data?.recommendations?.recommendations) {
        setRecommendations(prev => ({
          ...prev,
          [productId]: data.recommendations.recommendations.slice(0, 3)
        }));
        setFetchedItems(prev => new Set(prev).add(productId));
      }
    } catch (err) {
      console.error('Recommendations error:', err);
      setError(err instanceof Error ? err.message : 'Could not load recommendations');
    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }));
    }
  }, [fetchedItems]);

  useEffect(() => {
    const newItems = state.items.filter(item =>
      !fetchedItems.has(item.id) && !loading[item.id]
    );

    if (newItems.length > 0) {
      newItems.forEach((item, index) => {
        setTimeout(() => {
          fetchRecommendations(item);
        }, index * 300);
      });
    }
  }, [state.items, fetchRecommendations, fetchedItems, loading]);

  const handleIncreaseQuantity = (id: string) => {
    updateQuantity(id, 1);
  };

  const handleDecreaseQuantity = (id: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(id, -1);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    setFetchedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setRecommendations(prev => {
      const newRecs = { ...prev };
      delete newRecs[id];
      return newRecs;
    });
  };

  const handleAddRecommendation = (product: Recommendation) => {
    addToCart({
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  // Calculate cart totals
  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 35 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
        <Link
          to="/products"
          className="bg-[#0071ce] hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {state.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <div className="flex flex-col sm:flex-row gap-6">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 object-contain rounded-md"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{item.title}</h3>
                        <p className="text-gray-500 text-sm mt-1">Item #{item.id}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-1 text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => handleIncreaseQuantity(item.id)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Recommendations Section */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center mb-3">
                    <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                    <h4 className="font-medium text-gray-800">Recommended with this item</h4>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm mb-2">
                      {error}
                      <button
                        onClick={() => fetchRecommendations(item)}
                        className="ml-2 text-blue-600 underline"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {loading[item.id] ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071ce]"></div>
                    </div>
                  ) : recommendations[item.id]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendations[item.id].map((rec) => (
                        <div key={rec.id} className="border border-gray-100 rounded-md p-3 hover:shadow-sm transition-shadow">
                          <img
                            src={rec.image}
                            alt={rec.name}
                            className="w-full h-24 object-contain mb-2"
                          />
                          <h5 className="font-medium text-sm text-gray-800">{rec.name}</h5>
                          <p className="text-gray-500 text-xs mb-2 line-clamp-2">{rec.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-medium text-gray-800">${rec.price.toFixed(2)}</span>
                            <button
                              onClick={() => handleAddRecommendation(rec)}
                              className="text-[#0071ce] hover:text-blue-700 text-sm font-medium flex items-center"
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No recommendations available</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                className="w-full bg-[#0071ce] hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;