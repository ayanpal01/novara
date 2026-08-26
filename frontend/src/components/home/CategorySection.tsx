'use client';

import Link from "next/link";
import { motion } from "motion/react";

const CATEGORIES = [
  { title: "Men", link: "/shop/men", image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1887&auto=format&fit=crop", span: "col-span-1 md:col-span-2 row-span-2" },
  { title: "Women", link: "/shop/women", image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1995&auto=format&fit=crop", span: "col-span-1 md:col-span-2 row-span-2" },
  { title: "Accessories", link: "/shop/accessories", image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=1887&auto=format&fit=crop", span: "col-span-1 md:col-span-2 row-span-1" },
  { title: "Footwear", link: "/shop/footwear", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop", span: "col-span-1 md:col-span-1 row-span-1" },
  { title: "New Arrivals", link: "/shop?featured=true", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop", span: "col-span-1 md:col-span-1 row-span-1" }
];

export default function CategorySection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center mb-16 text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">Shop by Category</h2>
        <p className="text-muted-foreground max-w-2xl text-lg">Find your next statement piece.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-[250px] gap-4 sm:gap-6">
        {CATEGORIES.map((cat, i) => (
          <Link 
            key={cat.title} 
            href={cat.link}
            className={`group relative overflow-hidden rounded-xl bg-muted block ${cat.span}`}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 z-10" />
            <motion.img 
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              src={cat.image} 
              alt={cat.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6">
              <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">{cat.title}</h3>
              <div className="mt-4 opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <span className="text-white text-sm font-semibold tracking-widest uppercase border-b border-white pb-1">
                  Explore →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
