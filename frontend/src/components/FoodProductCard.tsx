import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Clock, Thermometer } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface NutritionFacts {
  calories: number;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
  sugar?: string;
}

interface FoodProduct {
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
  nutritionFacts?: NutritionFacts;
}

interface FoodProductCardProps {
  product: FoodProduct;
  className?: string;
  onAddToCart?: (productId: string) => void;
  onWishlistToggle?: (productId: string, isAdded: boolean) => void;
}

const FoodProductCard: React.FC<FoodProductCardProps> = ({
  product,
  className = '',
  onAddToCart,
  onWishlistToggle
}) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
      maxQuantity: product.stockQuantity || 99
    });

    if (result.success) {
      onAddToCart?.(product.id);
    } else {
      console.warn(result.message);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist(product.id)) {
      const result = await removeFromWishlist(product.id);
      if (result.success) {
        onWishlistToggle?.(product.id, false);
      }
    } else {
      const result = await addToWishlist({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        brand: product.brand
      });
      if (result.success) {
        onWishlistToggle?.(product.id, true);
      }
    }
  };

  const renderStorageBadge = () => {
    if (product.frozen) {
      return (
        <span className="absolute top-2 right-12 bg-cyan-500 text-white px-2 py-1 text-xs font-bold rounded flex items-center">
          <Thermometer className="w-3 h-3 mr-1" />
          Frozen
        </span>
      );
    }
    if (product.refrigerated) {
      return (
        <span className="absolute top-2 right-12 bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded flex items-center">
          <Thermometer className="w-3 h-3 mr-1" />
          Cold
        </span>
      );
    }
    return null;
  };

  const renderStockIndicator = () => {
    if (!product.inStock) {
      return (
        <span className="text-xs text-red-600 font-semibold">
          Out of stock
        </span>
      );
    }
    if (product.stockQuantity && product.stockQuantity < 10) {
      return (
        <span className="text-xs text-red-600 font-semibold">
          Only {product.stockQuantity} left!
        </span>
      );
    }
    return null;
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={`group block ${className}`}
      aria-label={`View ${product.title} details`}
    >
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 h-full flex flex-col">
        <div className="relative flex-shrink-0">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
              -{discount}%
            </span>
          )}

          {renderStorageBadge()}

          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${isInWishlist(product.id)
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white text-gray-400 hover:text-red-500'
              }`}
            aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="p-4 flex-grow flex flex-col">
          <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0071ce] transition-colors">
            {product.title}
          </h3>

          <div className="flex items-center justify-between mb-2">
            {product.unit && (
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {product.unit}
              </span>
            )}
            {product.expiryInfo && (
              <span className="text-xs text-orange-600 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {product.expiryInfo}
              </span>
            )}
          </div>

          {product.nutritionFacts && (
            <div className="mb-2 text-xs text-gray-600">
              <span className="font-semibold">{product.nutritionFacts.calories} cal</span>
              {product.nutritionFacts.protein && (
                <span className="ml-2">{product.nutritionFacts.protein} protein</span>
              )}
            </div>
          )}

          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">({product.reviews})</span>
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {renderStockIndicator()}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${product.inStock
                ? 'bg-[#0071ce] text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              aria-label={product.inStock ? 'Add to cart' : 'Out of stock'}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FoodProductCard;