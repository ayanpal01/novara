'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }, 1000);
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 border-t border-muted/50">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-4">Stay in the know</h2>
        <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-6">
          Join the Club
        </h3>
        <p className="text-muted-foreground mb-10 text-lg">
          Get early access to new collections, exclusive offers, and NOVARA updates.
        </p>
        
        <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading' || status === 'success'}
            placeholder="Your email address" 
            className="w-full bg-background border border-muted-foreground/30 px-6 py-4 text-foreground focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={status === 'loading' || status === 'success'}
            className="absolute right-0 top-0 bottom-0 px-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? (
              <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle2 size={20} className="text-green-600" />
            ) : (
              <ArrowRight size={20} />
            )}
          </button>
        </form>
        {status === 'success' && (
          <p className="text-sm text-green-600 font-medium mt-4">Thank you for subscribing!</p>
        )}
      </div>
    </section>
  );
}
