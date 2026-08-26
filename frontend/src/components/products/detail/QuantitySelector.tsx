'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (qty: number) => void;
  max: number;
  disabled?: boolean;
}

export default function QuantitySelector({ quantity, setQuantity, max, disabled }: QuantitySelectorProps) {
  return (
    <div className="flex items-center h-14 border border-input rounded-md overflow-hidden bg-background max-w-[140px]">
      <button 
        className={cn(
          "w-12 h-full flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground",
          (disabled || quantity <= 1) && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
        )}
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        disabled={disabled || quantity <= 1}
        aria-label="Decrease quantity"
      >
        <Minus size={16} strokeWidth={2} />
      </button>
      <span className="flex-1 text-center font-semibold text-base tabular-nums">
        {quantity}
      </span>
      <button 
        className={cn(
          "w-12 h-full flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground",
          (disabled || quantity >= max) && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
        )}
        onClick={() => setQuantity(Math.min(max, quantity + 1))}
        disabled={disabled || quantity >= max}
        aria-label="Increase quantity"
      >
        <Plus size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
