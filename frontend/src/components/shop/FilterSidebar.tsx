'use client';

interface FilterSidebarProps {
  minPrice: string;
  maxPrice: string;
  setMinPrice: (val: string) => void;
  setMaxPrice: (val: string) => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

export default function FilterSidebar({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  onClearFilters,
  hasFilters
}: FilterSidebarProps) {
  
  return (
    <aside className="w-64 shrink-0 hidden lg:block sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-6 custom-scrollbar">
      <div className="space-y-10">
        
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
                className="w-full pl-7 pr-3 py-2 bg-background border border-muted focus:border-foreground focus:outline-none rounded text-sm transition-colors"
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
                className="w-full pl-7 pr-3 py-2 bg-background border border-muted focus:border-foreground focus:outline-none rounded text-sm transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Availability</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-muted text-foreground accent-black focus:ring-0 cursor-pointer" />
              <span className="text-sm font-medium group-hover:text-muted-foreground transition-colors">In Stock</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group opacity-50">
              <input type="checkbox" disabled className="w-4 h-4 rounded border-muted text-foreground accent-black focus:ring-0 cursor-pointer" />
              <span className="text-sm font-medium transition-colors">Out of Stock</span>
            </label>
          </div>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <div className="pt-4 border-t border-muted/50">
            <button 
              onClick={onClearFilters}
              className="w-full py-3 bg-muted/50 text-foreground text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors rounded"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </aside>
  );
}
