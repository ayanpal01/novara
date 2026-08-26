'use client';

import { X } from 'lucide-react';

interface ActiveFiltersProps {
  category: string;
  minPrice: string;
  maxPrice: string;
  searchQuery: string;
  onClearCategory: () => void;
  onClearPrice: () => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}

export default function ActiveFilters({
  category,
  minPrice,
  maxPrice,
  searchQuery,
  onClearCategory,
  onClearPrice,
  onClearSearch,
  onClearAll
}: ActiveFiltersProps) {
  
  const hasFilters = category || minPrice || maxPrice || searchQuery;
  
  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mr-2">
        Active Filters:
      </span>
      
      {category && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-foreground text-xs font-medium rounded-full">
          <span className="capitalize">{category}</span>
          <button onClick={onClearCategory} className="hover:text-red-500 transition-colors ml-1"><X size={12} /></button>
        </span>
      )}
      
      {(minPrice || maxPrice) && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-foreground text-xs font-medium rounded-full">
          <span>₹{minPrice || '0'} - {maxPrice ? `₹${maxPrice}` : 'Max'}</span>
          <button onClick={onClearPrice} className="hover:text-red-500 transition-colors ml-1"><X size={12} /></button>
        </span>
      )}

      {searchQuery && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-foreground text-xs font-medium rounded-full">
          <span>"{searchQuery}"</span>
          <button onClick={onClearSearch} className="hover:text-red-500 transition-colors ml-1"><X size={12} /></button>
        </span>
      )}
      
      <button 
        onClick={onClearAll}
        className="text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors ml-2 border-b border-transparent hover:border-foreground"
      >
        Clear All
      </button>
    </div>
  );
}
