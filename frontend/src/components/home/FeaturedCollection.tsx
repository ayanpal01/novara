'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function FeaturedCollection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted order-2 lg:order-1"
        >
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
            alt="Essential Collection" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
        
        <div className="order-1 lg:order-2 space-y-8 max-w-xl">
          <div>
            <h2 className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-4">The Essential Collection</h2>
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[1.1]">
              Designed for confidence.
            </h3>
          </div>
          
          <div className="w-12 h-1 bg-foreground/20" />
          
          <p className="text-lg sm:text-xl text-muted-foreground font-light leading-relaxed">
            Created for everyday expression. Discover elevated essentials that combine comfort, versatility, and uncompromising style.
          </p>
          
          <Link 
            href="/collections/essentials" 
            className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-foreground hover:text-muted-foreground transition-colors border-b-2 border-foreground pb-2 hover:border-muted-foreground"
          >
            Explore Collection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
