'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import ProductCard from '@/components/products/ProductCard';

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const { data } = await api.get('/products?featured=true&limit=4');
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching best sellers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-muted/50">
      <div className="flex flex-col items-center text-center mb-16">
        <h2 className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-2">Trending</h2>
        <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Most Wanted</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted aspect-[3/4] rounded-xl mb-4"></div>
              <div className="h-4 bg-muted w-3/4 mb-2 rounded"></div>
              <div className="h-4 bg-muted w-1/4 rounded"></div>
            </div>
          ))
        ) : products.length > 0 ? (
          products.map((product: any, i: number) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-12 bg-muted/20 rounded-xl">No best sellers found.</p>
        )}
      </div>
    </section>
  );
}
