'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductAccordionProps {
  description: string;
}

export default function ProductAccordion({ description }: ProductAccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>('details');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: 'details',
      title: 'Product Details',
      content: (
        <>
          <p className="mb-4">{description}</p>
          <ul className="list-inside space-y-1 mt-4">
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-foreground rounded-full" /> Premium quality materials</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-foreground rounded-full" /> Ethically manufactured</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-foreground rounded-full" /> Designed for a modern fit</li>
          </ul>
        </>
      )
    },
    {
      id: 'fit',
      title: 'Size & Fit',
      content: (
        <ul className="list-inside space-y-1">
          <li className="flex items-center gap-2"><div className="w-1 h-1 bg-foreground rounded-full" /> True to size. We recommend your normal size.</li>
          <li className="flex items-center gap-2"><div className="w-1 h-1 bg-foreground rounded-full" /> Designed for a relaxed, comfortable fit.</li>
          <li className="flex items-center gap-2"><div className="w-1 h-1 bg-foreground rounded-full" /> Model is 6'1" and wearing size L.</li>
        </ul>
      )
    },
    {
      id: 'shipping',
      title: 'Shipping & Returns',
      content: (
        <ul className="list-inside space-y-3">
          <li>
            <strong className="text-foreground block mb-1">Free Standard Shipping</strong>
            Enjoy free shipping on all orders above ₹999. Usually delivers within 3-5 business days.
          </li>
          <li>
            <strong className="text-foreground block mb-1">Easy 7-Day Returns</strong>
            Not quite right? Return your item within 7 days in its original condition for a full refund or exchange.
          </li>
        </ul>
      )
    }
  ];

  return (
    <div className="w-full border-t">
      {sections.map((section) => {
        const isOpen = openSection === section.id;
        
        return (
          <div key={section.id} className="border-b">
            <button
              className="flex w-full items-center justify-between py-4 text-sm font-semibold uppercase tracking-widest hover:text-primary transition-colors"
              onClick={() => toggleSection(section.id)}
            >
              {section.title}
              <ChevronDown 
                size={16} 
                className={cn("transition-transform duration-200 text-muted-foreground", isOpen && "rotate-180")} 
              />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 text-muted-foreground leading-relaxed text-sm">
                    {section.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
