'use client';

import { useCartStore, useCartTotal } from '@/lib/store';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartSheet() {
  const { isOpen, setIsOpen, cartItems, updateQuantity, removeItem } = useCartStore();
  const total = useCartTotal();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for persisted store
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full border-l px-0 sm:px-6">
        <SheetHeader className="px-6 sm:px-0 mb-6">
          <SheetTitle className="flex items-center gap-2 text-2xl font-bold">
            <ShoppingBag /> Your Cart ({cartItems.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 sm:px-0">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <ShoppingBag size={64} className="opacity-20" />
              <p className="text-lg">Your cart is empty.</p>
              <Button asChild>
                <Link href="/shop" onClick={() => setIsOpen(false)}>Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.size}-${item.color}`} className="flex gap-4 border-b pb-6 last:border-0">
                  <div className="w-24 h-32 bg-muted rounded-md overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link 
                          href={`/product/${item.slug}`} 
                          onClick={() => setIsOpen(false)}
                          className="font-semibold text-lg hover:underline line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button 
                          onClick={() => removeItem(item._id, item.size, item.color)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-4"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 space-y-1">
                        <p>Size: {item.size}</p>
                        {item.color && <p>Color: {item.color}</p>}
                        <p className="font-semibold text-foreground">₹{item.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center border rounded-md w-28 h-9 mt-4">
                      <button 
                        className="flex-1 h-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                        onClick={() => updateQuantity(item._id, item.size, item.qty - 1, item.color)}
                        disabled={item.qty <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="flex-1 text-center font-medium text-sm">{item.qty}</span>
                      <button 
                        className="flex-1 h-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                        onClick={() => updateQuantity(item._id, item.size, item.qty + 1, item.color)}
                        disabled={item.qty >= item.stock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t pt-6 px-6 sm:px-0 mt-6 bg-background">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium">Subtotal</span>
              <span className="text-2xl font-bold">₹{total.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Shipping and taxes calculated at checkout.</p>
            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full text-lg h-14" asChild>
                <Link href="/checkout" onClick={() => setIsOpen(false)}>Checkout</Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
