'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function HeroSection() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 bg-black/30 z-10" />
      <motion.img 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop" 
        alt="Premium Fashion Collection" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-white/80 uppercase mb-6"
        >
          Premium Fashion / New Collection
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.9]"
        >
          Define Your <br /> Style
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-gray-200 mb-12 font-light max-w-xl mx-auto"
        >
          Discover curated fashion designed for every moment. Elevate your everyday expression.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link 
            href="/shop?featured=true" 
            className="group bg-white text-black px-8 py-4 w-full sm:w-auto font-bold uppercase tracking-wider text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
          >
            Shop New Arrivals 
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/shop" 
            className="group bg-transparent border border-white/50 text-white px-8 py-4 w-full sm:w-auto font-bold uppercase tracking-wider text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-3"
          >
            Explore Collection
          </Link>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">Scroll to explore</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" />
      </motion.div>
    </section>
  );
}
