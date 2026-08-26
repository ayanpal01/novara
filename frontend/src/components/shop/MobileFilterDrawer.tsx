'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  minPrice: string;
  maxPrice: string;
  setMinPrice: (val: string) => void;
  setMaxPrice: (val: string) => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  onClearFilters,
  hasFilters
}: MobileFilterDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b border-muted flex flex-row items-center justify-between sticky top-0 bg-background z-10">
          <SheetTitle className="text-lg font-bold tracking-tight m-0">Filters</SheetTitle>
          {/* Note: Sheet automatically adds a close button, but you can hide it via CSS and use this or rely on default */}
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-10">
          {/* Price Range */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Price Range</h3>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-3 bg-background border border-muted focus:border-foreground focus:outline-none rounded text-sm transition-colors"
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-3 bg-background border border-muted focus:border-foreground focus:outline-none rounded text-sm transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Availability</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded border-muted text-foreground accent-black focus:ring-0 cursor-pointer" />
                <span className="text-base font-medium">In Stock</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group opacity-50">
                <input type="checkbox" disabled className="w-5 h-5 rounded border-muted text-foreground accent-black focus:ring-0 cursor-pointer" />
                <span className="text-base font-medium">Out of Stock</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-muted bg-background grid grid-cols-2 gap-4 pb-8">
          <Button 
            variant="outline" 
            className="w-full py-6 font-bold uppercase tracking-widest text-xs"
            onClick={onClearFilters}
            disabled={!hasFilters}
          >
            Clear All
          </Button>
          <Button 
            className="w-full py-6 font-bold uppercase tracking-widest text-xs"
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
