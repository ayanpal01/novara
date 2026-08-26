'use client';

import Link from 'next/link';

interface ShopHeaderProps {
  totalProducts: number;
}

export default function ShopHeader({ totalProducts }: ShopHeaderProps) {
  return (
    <div className="pt-2 pb-0">
      <nav className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Shop</span>
      </nav>
      
      {/* <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Shop All</h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Discover carefully curated pieces designed for every style.
          </p>
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          Showing {totalProducts} products
        </div>
      </div> */}
    </div>
  );
}
