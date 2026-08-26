'use client';

import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyProductsProps {
  onClearFilters: () => void;
}

export default function EmptyProducts({ onClearFilters }: EmptyProductsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6 text-muted-foreground">
        <SearchX size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-bold tracking-tight mb-2">No products found</h3>
      <p className="text-muted-foreground mb-8 max-w-sm">
        We couldn't find anything matching your current filters. Try adjusting your search or category.
      </p>
      <Button 
        onClick={onClearFilters}
        className="font-semibold uppercase tracking-wider text-xs px-8 h-12"
      >
        Clear All Filters
      </Button>
    </div>
  );
}
