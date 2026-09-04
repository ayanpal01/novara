'use client';

import { ShoppingBag, Check, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface AddToCartSectionProps {
  onAdd: () => void;
  isAdding: boolean;
  isAdded: boolean;
  disabled: boolean;
  buttonText: string;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
}

export default function AddToCartSection({
  onAdd,
  isAdding,
  isAdded,
  disabled,
  buttonText,
  isWishlisted,
  onToggleWishlist
}: AddToCartSectionProps) {
  const { isLoaded, isSignedIn } = useUser();

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoaded || !isSignedIn) {
      toast.error('Please sign in to add to wishlist');
      return;
    }
    onToggleWishlist?.();
  };

  return (
    <div className="flex gap-4">
      <Button 
        size="lg" 
        className="flex-1 h-14 text-sm font-bold uppercase tracking-widest rounded-md relative overflow-hidden transition-all duration-300 group"
        onClick={onAdd}
        disabled={disabled || isAdding || isAdded}
        variant={isAdded ? "secondary" : "default"}
      >
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div key="adding" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              ADDING...
            </motion.div>
          ) : isAdded ? (
            <motion.div key="added" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
              <Check size={18} /> ADDED TO BAG
            </motion.div>
          ) : (
            <motion.div key="default" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center justify-center gap-2">
              <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" /> {buttonText}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-14 w-14 shrink-0 rounded-md border-input hover:bg-muted/50 hover:text-red-500 transition-colors"
        onClick={handleWishlist}
        aria-label="Add to Wishlist"
      >
        <Heart 
          size={20} 
          className={isWishlisted ? "fill-red-500 text-red-500" : ""} 
          strokeWidth={isWishlisted ? 2 : 1.5} 
        />
      </Button>
    </div>
  );
}
