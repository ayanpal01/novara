'use client';

import Link from 'next/link';

export default function PromotionalBanner() {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/40 z-10" />
      <img 
        src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop" 
        alt="Seasonal Edit" 
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center 30%' }}
      />
      
      <div className="relative z-20 text-center max-w-3xl mx-auto">
        <h2 className="text-sm font-bold tracking-[0.2em] text-white/90 uppercase mb-4">Seasonal Edit</h2>
        <h3 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-tight">
          Up to 40% Off <br/> Selected Styles
        </h3>
        <p className="text-lg md:text-xl text-gray-200 mb-10 font-light">
          Discover pieces made for the new season. Limited time offer.
        </p>
        
        <Link 
          href="/shop?sale=true" 
          className="inline-block bg-white text-black px-10 py-4 font-bold uppercase tracking-wider text-sm hover:bg-gray-100 transition-colors"
        >
          Shop the Edit
        </Link>
      </div>
    </section>
  );
}
