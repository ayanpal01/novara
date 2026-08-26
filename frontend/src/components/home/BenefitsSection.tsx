'use client';

import { Award, Truck, RefreshCcw, ShieldCheck } from 'lucide-react';

const BENEFITS = [
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Curated products made to stand out.'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Reliable delivery across India.'
  },
  {
    icon: RefreshCcw,
    title: 'Easy Returns',
    description: 'Simple and hassle-free returns.'
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Your payments are safe and protected.'
  }
];

export default function BenefitsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-muted/50">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {BENEFITS.map((benefit, i) => {
          const Icon = benefit.icon;
          return (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-6 group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <h4 className="text-lg font-bold mb-2 tracking-tight">{benefit.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
