'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const { data } = await api.get('/products?sort=-createdAt&limit=4');
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching new arrivals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-muted/50">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h2 className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-2">The Latest</h2>
          <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">New Arrivals</h3>
          <p className="text-muted-foreground mt-4 text-lg">The latest pieces, curated for you.</p>
        </div>
        <Link href="/shop?sort=-createdAt" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors">
          View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
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
          <p className="col-span-full text-center text-muted-foreground py-12 bg-muted/20 rounded-xl">No new arrivals found.</p>
        )}
      </div>
    </section>
  );
}
