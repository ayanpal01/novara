'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import api from '@/lib/axios';

import ShopHeader from '@/components/shop/ShopHeader';
import ShopToolbar from '@/components/shop/ShopToolbar';
import ActiveFilters from '@/components/shop/ActiveFilters';
import FilterSidebar from '@/components/shop/FilterSidebar';
import MobileFilterDrawer from '@/components/shop/MobileFilterDrawer';
import ProductSkeleton from '@/components/shop/ProductSkeleton';
import EmptyProducts from '@/components/shop/EmptyProducts';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ShopListing() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Filters State
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);

  const hasFilters = !!(category || debouncedMinPrice || debouncedMaxPrice || debouncedSearch);

  // Fetch logic
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (debouncedMinPrice) params.append('minPrice', debouncedMinPrice);
      if (debouncedMaxPrice) params.append('maxPrice', debouncedMaxPrice);
      if (sort) params.append('sort', sort);
      if (debouncedSearch) params.append('search', debouncedSearch);
      params.append('page', page.toString());
      params.append('limit', '12');

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotalProducts(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  }, [category, debouncedMinPrice, debouncedMaxPrice, sort, debouncedSearch, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (debouncedMinPrice) params.append('minPrice', debouncedMinPrice);
    if (debouncedMaxPrice) params.append('maxPrice', debouncedMaxPrice);
    if (sort) params.append('sort', sort);
    if (debouncedSearch) params.append('search', debouncedSearch);
    if (page > 1) params.append('page', page.toString());
    
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  }, [category, debouncedMinPrice, debouncedMaxPrice, sort, debouncedSearch, page, pathname, router]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [category, debouncedMinPrice, debouncedMaxPrice, sort, debouncedSearch]);

  const handleClearAll = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 max-w-[1600px]">
      <ShopHeader totalProducts={totalProducts} />
      
      <ShopToolbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
        onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
      />

      <ActiveFilters 
        category={category}
        minPrice={minPrice}
        maxPrice={maxPrice}
        searchQuery={searchQuery}
        onClearCategory={() => setCategory('')}
        onClearPrice={() => { setMinPrice(''); setMaxPrice(''); }}
        onClearSearch={() => setSearchQuery('')}
        onClearAll={handleClearAll}
      />

      <div className="flex gap-12 items-start pb-24">
        <FilterSidebar 
          minPrice={minPrice}
          maxPrice={maxPrice}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          onClearFilters={handleClearAll}
          hasFilters={hasFilters}
        />
        
        <MobileFilterDrawer 
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          minPrice={minPrice}
          maxPrice={maxPrice}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          onClearFilters={handleClearAll}
          hasFilters={hasFilters}
        />

        <div className="flex-1 w-full min-w-0">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : products.length > 0 ? (
              products.map((product: any, i: number) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyProducts onClearFilters={handleClearAll} />
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-20">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => {
                  setPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-32 uppercase tracking-widest text-xs font-bold"
              >
                <ChevronLeft size={16} className="mr-2" /> Previous
              </Button>
              <span className="text-sm font-medium text-muted-foreground w-20 text-center">
                {page} / {totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={page === totalPages}
                onClick={() => {
                  setPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-32 uppercase tracking-widest text-xs font-bold"
              >
                Next <ChevronRight size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
