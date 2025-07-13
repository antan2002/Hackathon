import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { CartItem } from '../types/cart';

interface Product {
  id: string;
  title: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  stockQuantity?: number;
  unit?: string;
  expiryInfo?: string;
  refrigerated?: boolean;
  frozen?: boolean;
  category: string;
  ingredients: string[];
  specifications: {
    brand?: string;
    quantity?: number;
    unit?: string;
    organic?: boolean;
    storageInstructions?: string;
    nutritionInfo?: Record<string, string | number>;
  };
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const cartItem: CartItem = {
      id: product.id,
      title: product.title || product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      category: product.category,
      ingredients: product.ingredients,
      maxQuantity: product.stockQuantity || 99,
      inStock: product.inStock
    };

    const result = addToCart(cartItem);

    if (!result.success) {
      alert(result.message);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        title: product.title || product.name,
        price: product.price,
        image: product.image,
        brand: product.brand,
        category: product.category,
        ingredients: [],
        inStock: false
      });
    }
  };

  const displayTitle = product.title || product.name;
  const displayUnit = product.unit ||
    (product.specifications?.quantity && product.specifications?.unit
      ? `${product.specifications.quantity} ${product.specifications.unit}`
      : '');

  return (
    <Link
      to={`/product/${product.id}`}
      className={`group ${viewMode === 'list' ? 'flex' : 'block'}`}
      aria-label={`View ${displayTitle} details`}
    >
      <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 ${viewMode === 'list' ? 'flex w-full' : ''}`}>
        <div className={`relative ${viewMode === 'list' ? 'w-1/3' : 'w-full'}`}>
          <img
            src={product.image || '/placeholder.png'}
            alt={displayTitle}
            className={`${viewMode === 'list' ? 'h-full' : 'h-48'} w-full object-cover group-hover:scale-105 transition-transform duration-300`}
            loading="lazy"
          />

          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
              -{discount}%
            </span>
          )}

          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${isInWishlist(product.id)
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white text-gray-400 hover:text-red-500'
              }`}
            aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </button>

          {product.refrigerated && (
            <span className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded">
              Refrigerated
            </span>
          )}
          {product.frozen && (
            <span className="absolute bottom-2 left-2 bg-cyan-500 text-white px-2 py-1 text-xs font-bold rounded">
              Frozen
            </span>
          )}
        </div>

        <div className={`p-4 ${viewMode === 'list' ? 'w-2/3' : ''}`}>
          <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0071ce] transition-colors">
            {displayTitle}
          </h3>

          {product.ingredients?.length > 0 && (
            <p className="text-xs text-gray-500 mb-2">
              Ingredients: {product.ingredients.slice(0, 3).join(', ')}
              {product.ingredients.length > 3 ? '...' : ''}
            </p>
          )}

          {displayUnit && (
            <p className="text-sm text-gray-600 mb-2">{displayUnit}</p>
          )}

          {product.expiryInfo && (
            <div className="text-xs text-orange-600 flex items-center mb-2">
              <Clock className="w-3 h-3 mr-1" />
              {product.expiryInfo}
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

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.stockQuantity && product.stockQuantity < 10 && (
              <span className="text-xs text-red-600 font-semibold">
                Only {product.stockQuantity} left!
              </span>
            )}
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
    </Link>
  );
};

export default ProductCard;