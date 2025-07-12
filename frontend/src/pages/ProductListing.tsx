import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List } from 'lucide-react';
import ProductCard from '../components/ProductCard';

interface Product {
  id: string; // Match backend
  title: string; // Map from name
  brand: string; // Map from specifications.brand
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

const ProductListing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({ category: '', priceRange: '' });

  const category = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('query', searchQuery);
        if (category) params.append('category', category);
        if (filters.priceRange) {
          const [min, max] = filters.priceRange.split('-');
          if (min) params.append('minPrice', min);
          if (max) params.append('maxPrice', max);
        }

        const res = await fetch(`http://localhost:5000/api/products/search?${params.toString()}`);
        const raw = await res.json();

        const mapped: Product[] = raw.map((p: any) => ({
          id: p.id,
          title: p.name,
          brand: p.specifications?.brand || 'Unknown',
          price: p.price,
          originalPrice: p.originalPrice || undefined,
          image: p.image ? p.image : '/placeholder.png',
          rating: p.rating || 4,
          reviews: p.reviews || 100,
          inStock: true,
          stockQuantity: p.specifications?.quantity || 10,
          unit: `${p.specifications?.quantity || ''} ${p.specifications?.unit || ''}`,
          expiryInfo: p.specifications?.storageInstructions || '',
          refrigerated: p.specifications?.refrigerated || false,
          frozen: p.specifications?.frozen || false,
        }));

        setProducts(mapped);
      } catch (err) {
        console.error('Failed to fetch products', err);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {category ? category : searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
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
            </select>
            <button onClick={() => setViewMode('grid')}>
              <Grid className={`w-5 h-5 ${viewMode === 'grid' ? 'text-blue-500' : ''}`} />
            </button>
            <button onClick={() => setViewMode('list')}>
              <List className={`w-5 h-5 ${viewMode === 'list' ? 'text-blue-500' : ''}`} />
            </button>
          </div>
        </div>

        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
