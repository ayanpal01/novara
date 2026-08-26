'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShopToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  category: string;
  setCategory: (cat: string) => void;
  sort: string;
  setSort: (sort: string) => void;
  onOpenMobileFilters: () => void;
}

export default function ShopToolbar({
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  sort,
  setSort,
  onOpenMobileFilters
}: ShopToolbarProps) {
  
  const categories = [
    { label: 'All Products', value: '' },
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
    { label: 'Accessories', value: 'accessories' }
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-4 border-y border-muted/50 mb-6">
      
      {/* Search & Categories */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-muted/30 border border-muted focus:border-foreground focus:outline-none rounded-md text-sm transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.label}
              onClick={() => setCategory(cat.value)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                category === cat.value 
                  ? 'bg-foreground text-background' 
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort & Mobile Filter Toggle */}
      <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
          <select 
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent border-none text-sm font-bold uppercase tracking-wider outline-none cursor-pointer hover:text-primary transition-colors pr-2"
          >
            <option value="-createdAt">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="-rating">Highest Rated</option>
          </select>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onOpenMobileFilters}
          className="lg:hidden flex items-center gap-2 uppercase tracking-widest text-xs font-bold"
        >
          <SlidersHorizontal size={14} /> Filters
        </Button>
      </div>

    </div>
  );
}
