import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Sparkles, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

// Define complete type interfaces
interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
  category?: string;
  ingredients?: string[];
}

interface NutritionInfo {
  calories: number;
  protein: number;
  sugar: number;
  sodium: number;
  fat: number;
}

interface Recommendation {
  _id: string;
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  ingredients: string[];
  specifications: {
    nutritionInfo: NutritionInfo;
    [key: string]: any;
  };
  reasoning?: string;
}

const Cart: React.FC = () => {
  const { state, updateQuantity, removeFromCart, addToCart } = useCart();
  const [recommendations, setRecommendations] = useState<Record<string, Recommendation[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch recommendations for a product
  const fetchRecommendations = useCallback(async (product: CartItem) => {
    const productId = product.id;
    setLoading(prev => ({ ...prev, [productId]: true }));
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/cart/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: [{
            id: productId,
            name: product.title,
            category: product.category || '',
            ingredients: product.ingredients || []
          }]
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');

      const data = await response.json();

      if (data.success && data.recommendations?.recommendations) {
        setRecommendations(prev => ({
          ...prev,
          [productId]: data.recommendations.recommendations.slice(0, 3)
        }));
      }
    } catch (err) {
      setError('Could not load recommendations. Please try again later.');
      console.error('Recommendations error:', err);
    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }));
    }
  }, []);

  // Fetch recommendations when cart changes
  useEffect(() => {
    state.items.forEach(item => {
      if (!recommendations[item.id] && !loading[item.id]) {
        fetchRecommendations(item);
      }
    });
  }, [state.items, fetchRecommendations, recommendations, loading]);

  // Cart item handlers
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    const result = updateQuantity(id, newQuantity);
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const handleAddRecommendation = (recommendation: Recommendation) => {
    const newItem: CartItem = {
      id: recommendation.id,
      title: recommendation.name,
      price: recommendation.price,
      image: recommendation.image || '/placeholder-product.jpg',
      quantity: 1,
      category: recommendation.category,
      ingredients: recommendation.ingredients
    };

    addToCart(newItem);
    fetchRecommendations(newItem);
  };

  // Calculate cart totals
  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 35 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
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
        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({state.items.reduce((sum, item) => sum + item.quantity, 0)} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {state.items.map((item) => (
                <div key={item.id} className="p-6 border-b border-gray-200 last:border-b-0">
                  {/* Product Info */}
                  <div className="flex items-center mb-4">
                    <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-lg mr-6" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      {item.variant && (
                        <p className="text-gray-600 text-sm mb-2">
                          Options: {JSON.parse(item.variant).size || JSON.parse(item.variant).color}
                        </p>
                      )}
                      <p className="text-[#0071ce] font-bold text-lg">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-2 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Recommendations Section */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center mb-3">
                      <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                      <h4 className="font-medium text-gray-800">Recommended with this item</h4>
                    </div>

                    {loading[item.id] ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071ce]"></div>
                      </div>
                    ) : error ? (
                      <p className="text-red-500 text-sm">{error}</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recommendations[item.id]?.map((rec) => (
                          <div key={rec._id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                            <div className="flex items-start">
                              <div className="bg-gray-200 w-12 h-12 rounded-md mr-3 flex-shrink-0 flex items-center justify-center">
                                {rec.image ? (
                                  <img src={rec.image} alt={rec.name} className="w-full h-full object-cover rounded-md" />
                                ) : (
                                  <ShoppingBag className="w-5 h-5 text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{rec.name}</h5>
                                <p className="text-sm text-gray-600">${rec.price.toFixed(2)}</p>
                                {rec.specifications?.nutritionInfo && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    <span className="font-medium">Nutrition: </span>
                                    {rec.specifications.nutritionInfo.calories} cal
                                  </div>
                                )}
                                <button
                                  onClick={() => handleAddRecommendation(rec)}
                                  className="mt-2 flex items-center text-xs bg-[#0071ce] text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                                >
                                  <ShoppingCart className="w-3 h-3 mr-1" />
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link to="/products" className="text-[#0071ce] hover:underline font-semibold">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({state.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-sm text-gray-600">
                    Add ${(35 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Promo Code</label>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce]"
                  />
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-r-lg hover:bg-gray-300 transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-[#0071ce] text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-6 block text-center"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-4 text-center text-sm text-gray-500">
                <p>🔒 Secure checkout with SSL encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;