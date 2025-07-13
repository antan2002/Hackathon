
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Sparkles, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CartItem, Recommendation, CartItemRequest } from '../types/cart';

const Cart: React.FC = () => {
  const { state, updateQuantity, removeFromCart, addToCart } = useCart();
  const [recommendations, setRecommendations] = useState<Record<string, Recommendation[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [fetchedItems, setFetchedItems] = useState<Set<string>>(new Set());

  const toCartItemRequest = (item: CartItem): CartItemRequest => {
    if (!item.id || !item.category) {
      throw new Error(`Missing required fields for product ${item.id}`);
    }
    return {
      id: item.id,
      name: item.title || `Product ${item.id}`,
      category: item.category,
      ingredients: Array.isArray(item.ingredients) ? item.ingredients : []
    };
  };

  const fetchRecommendations = useCallback(async (product: CartItem) => {
    const productId = product.id;
    if (fetchedItems.has(productId) || loading[productId]) return;

    setLoading(prev => ({ ...prev, [productId]: true }));
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/cart/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          cartItems: [toCartItemRequest(product)]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recommendations');
      }

      const data = await response.json();
      const recData = data.recommendations || data; // Handle both nested and direct response

      const recs = recData.recommendations || [];
      const explanations = recData.explanation || [];
      const metrics = recData.metrics || [];

      const enrichedRecs: Recommendation[] = recs.map((rec: any) => {
        const explanationObj = explanations.find((e: any) => e.id === rec.id);
        const metricObj = metrics.find((m: any) => m.id === rec.id);

        return {
          id: rec.id,
          name: rec.name,
          price: rec.price,
          category: rec.category,
          ingredients: rec.ingredients,
          image: rec.image || '/placeholder-product.jpg',
          reasoning: explanationObj?.reasoning || 'Recommended based on your preferences',
          healthIndex: metricObj?.healthIndex || 0,
          valueScore: metricObj?.valueScore || 0,
          variant: rec.variant || ''
        };
      });

      setRecommendations(prev => ({
        ...prev,
        [productId]: enrichedRecs.slice(0, 3)
      }));
      setFetchedItems(prev => new Set(prev).add(productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recommendation service unavailable');
    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }));
    }
  }, [fetchedItems, loading]);

  useEffect(() => {
    const newItems = state.items.filter(item =>
      !fetchedItems.has(item.id) && !loading[item.id]
    );

    if (newItems.length > 0) {
      newItems.forEach((item, index) => {
        setTimeout(() => fetchRecommendations(item), index * 300);
      });
    }
  }, [state.items, fetchRecommendations, fetchedItems, loading]);

  // Rest of the component remains the same...
  const handleIncreaseQuantity = (id: string) => {
    const item = state.items.find(item => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1, item.variant);
    }
  };

  const handleDecreaseQuantity = (id: string, currentQuantity: number) => {
    const item = state.items.find(item => item.id === id);
    if (item) {
      if (currentQuantity > 1) {
        updateQuantity(id, item.quantity - 1, item.variant);
      }
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
    const cartItem: CartItem = {
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      category: product.category,
      ingredients: product.ingredients,
      variant: product.variant,
      maxQuantity: 0,
      inStock: false
    };
    addToCart(cartItem);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-10">Your Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {state.items.map((item) => (
              <div key={`${item.id}-${item.variant || 'default'}`} className="bg-white rounded-2xl shadow-md p-6 transition-all hover:shadow-lg">
                <div className="flex flex-col sm:flex-row gap-6">
                  <img src={item.image} alt={item.title} className="w-28 h-28 object-contain rounded-lg border" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                        {item.variant && <p className="text-gray-500 text-sm mt-1">Variant: {item.variant}</p>}
                        <p className="text-gray-500 text-sm mt-1">{item.category}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                        <button
                          onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-1 text-gray-800 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleIncreaseQuantity(item.id)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced AI Recommendation Section */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center mb-5">
                    <div className="bg-gradient-to-tr from-purple-500 to-indigo-500 p-2 rounded-full shadow-md mr-3">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800">AI-Powered Product Recommendations</h4>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-300 p-4 rounded-lg mb-5">
                      <div className="flex items-center text-red-700 text-sm">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                      </div>
                      <button
                        onClick={() => fetchRecommendations(item)}
                        className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Try Again
                      </button>
                    </div>
                  )}

                  {loading[item.id] ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : recommendations[item.id]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {recommendations[item.id].map((rec) => (
                        <div key={rec.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="relative h-32 mb-4 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center">
                            <img
                              src={rec.image}
                              alt={rec.name}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <h5 className="text-base font-semibold text-gray-800 mb-1">{rec.name}</h5>
                          {rec.variant && <p className="text-gray-500 text-xs mb-1">Variant: {rec.variant}</p>}

                          <p className="text-gray-900 font-medium mb-1">${rec.price.toFixed(2)}</p>

                          {rec.reasoning && (
                            <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-md mb-3 text-xs italic text-green-700">
                              {rec.reasoning}
                            </div>
                          )}

                          <div className="flex justify-start gap-2 mb-3 text-xs font-medium">
                            {rec.healthIndex !== undefined && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                Health: {rec.healthIndex}/20
                              </span>
                            )}
                            {rec.valueScore !== undefined && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                Value: {rec.valueScore.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleAddRecommendation(rec)}
                            className="w-full bg-gradient-to-r from-[#0071ce] to-[#005bb5] hover:from-[#005bb5] hover:to-[#004799] text-white text-sm font-semibold py-2 rounded-md flex items-center justify-center transition"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500 text-sm">No recommendations available</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-800">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span className="font-medium text-gray-800">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                className="w-full bg-[#0071ce] hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
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