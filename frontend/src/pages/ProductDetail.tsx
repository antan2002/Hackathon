import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Leaf, Thermometer, Calendar, Box } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface NutritionInfo {
  calories: number;
  protein: number;
  sugar: number;
  sodium: number;
  fat: number;
  [key: string]: string | number;
}

interface ProductSpecifications {
  quantity: number;
  unit: string;
  brand: string;
  nutritionInfo: NutritionInfo;
  organic: boolean;
  storageInstructions: string;
  refrigerated?: boolean;
  frozen?: boolean;
}

interface Product {
  _id: string;
  id: string;
  name: string;
  category: string;
  ingredients: string[];
  price: number;
  specifications: ProductSpecifications;
  popularityScore: number;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  inStock?: boolean;
  stockQuantity?: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) {
      setError('Invalid product ID');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
        const productData = data.product || data;

        // Ensure all required fields are present
        if (!productData.name || !productData.category || !productData.ingredients || !productData.specifications) {
          throw new Error('Invalid product data structure');
        }

        setProduct(productData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.imageUrl || '/placeholder-vegetable.png',
      quantity: 1,
      maxQuantity: product.stockQuantity || product.specifications.quantity || 99,
      inStock: product.inStock ?? true,
      // Required FoodProduct fields
      category: product.category,
      ingredients: product.ingredients,
      // Optional fields
      brand: product.specifications.brand,
      rating: product.rating,
      reviews: product.reviews
    };

    const result = addToCart(cartItem);
    alert(result.message);
  };

  if (loading) return <div className="p-10 text-center">Loading product details...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!product) return <div className="p-10 text-center">Product not found</div>;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const formattedDate = new Date(product.createdAt).toLocaleDateString();

  // Safe check for imageUrl array
  const currentImage = product.imageUrl || '/placeholder-vegetable.png';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <nav className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600">Home</Link> /{' '}
          <Link to="/products" className="hover:text-blue-600">Products</Link> /{' '}
          <Link to={`/products?category=${product.category}`} className="hover:text-blue-600 capitalize">
            {product.category}
          </Link> /{' '}
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Product imageUrl */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="relative">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-80 md:h-96 object-contain rounded-lg"
                loading="lazy"
              />
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-full">
                  {discount}% OFF
                </span>
              )}

            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full capitalize">
                  {product.category}
                </span>
                {product.specifications.organic && (
                  <span className="flex items-center text-sm bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                    <Leaf className="w-4 h-4 mr-1" /> Organic
                  </span>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-900">
                ₹{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.popularityScore > 0 && (
                <span className="flex items-center text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  <Star className="w-4 h-4 mr-1 fill-current" /> Popular
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < (product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({product.reviews || 0} reviews)
              </span>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Box className="w-5 h-5 text-gray-400" />
                  <span>
                    {product.specifications.quantity} {product.specifications.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Thermometer className="w-5 h-5 text-gray-400" />
                  <span>{product.specifications.storageInstructions}</span>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.inStock === false}
                className={`flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg text-lg font-medium transition ${product.inStock !== false
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* Product Details */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h2 className="font-semibold text-lg mb-3">Product Details</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <p><strong>Brand:</strong> {product.specifications.brand}</p>
                <p><strong>Ingredients:</strong> {product.ingredients.join(', ')}</p>
                <p><strong>Stock Status:</strong>
                  <span className={'text-green-600 ml-2'}>
                    {'In Stock'}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Added on {formattedDate}</span>
                </p>
              </div>
            </div>

            {/* Nutrition Information */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h2 className="font-semibold text-lg mb-3">Nutrition Information</h2>
              <p className="text-sm text-gray-500 mb-3">Per serving:</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                {Object.entries(product.specifications.nutritionInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-2">
                    <span className="font-medium capitalize">{key}:</span>
                    <span>{typeof value === 'number' ? value.toFixed(1) : value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;