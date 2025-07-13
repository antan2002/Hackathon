import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, List } from 'lucide-react';
import ProductCard from '../components/ProductCard';

interface Product {
  id: string;
  name: string;
  title: string;
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
    refrigerated?: boolean;
    frozen?: boolean;
  };
  popularityScore?: number;
}

const ProductListing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({ category: '', priceRange: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const category = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (searchQuery) params.append('query', searchQuery);
        if (category) params.append('category', category);
        if (filters.priceRange) {
          const [min, max] = filters.priceRange.split('-');
          if (min) params.append('minPrice', min);
          if (max) params.append('maxPrice', max);
        }

        const res = await fetch(`http://localhost:5000/api/products/search?${params.toString()}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }

        const rawProducts = await res.json();
        console.log('Fetched products:', rawProducts); // Log fetched products to console

        const mapped: Product[] = rawProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          title: p.name,
          category: p.category,
          ingredients: p.ingredients || [],
          brand: p.specifications?.brand || 'Unknown',
          price: p.price,
          originalPrice: p.originalPrice || undefined,
          image: p.imageUrl || '/placeholder.png',
          images: p.images || [],
          rating: p.rating || 4,
          reviews: p.reviews || 100,
          inStock: p.inStock !== false,
          stockQuantity: p.stockQuantity || p.specifications?.quantity || 10,
          unit: p.specifications?.unit || '',
          expiryInfo: p.specifications?.storageInstructions || '',
          refrigerated: p.specifications?.refrigerated || false,
          frozen: p.specifications?.frozen || false,
          specifications: p.specifications || {},
          popularityScore: p.popularityScore || 0
        }));

        setProducts(mapped);
      } catch (err) {
        console.error('Failed to fetch products', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchQuery, filters]);

  const clearFilters = () => {
    setFilters({ category: category || '', priceRange: '' });
  };

  let sortedProducts = [...products];
  if (sortBy === 'price-low') sortedProducts.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-high') sortedProducts.sort((a, b) => b.price - a.price);
  else if (sortBy === 'popularity') sortedProducts.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));

  if (loading) return <div className="min-h-screen p-6 text-center">Loading products...</div>;
  if (error) return <div className="min-h-screen p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {category ? category : searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
            <span className="text-sm text-gray-500 ml-2">({products.length} items)</span>
          </h1>
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popularity">Popularity</option>
            </select>
            <button onClick={() => setViewMode('grid')}>
              <Grid className={`w-5 h-5 ${viewMode === 'grid' ? 'text-blue-500' : ''}`} />
            </button>
            <button onClick={() => setViewMode('list')}>
              <List className={`w-5 h-5 ${viewMode === 'list' ? 'text-blue-500' : ''}`} />
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {sortedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListing;