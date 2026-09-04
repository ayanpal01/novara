'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';

interface Product {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  slug: string;
}

export default function WishlistPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, setIsOpen } = useCartStore();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!isSignedIn) return;
        const token = await getToken();
        const res = await api.get('/wishlist', { headers: { Authorization: `Bearer ${token}` } });
        setProducts(res.data);
      } catch (err) {
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, [isSignedIn, getToken]);

  const removeFromWishlist = async (productId: string) => {
    try {
      const token = await getToken();
      const res = await api.post('/wishlist', { productId }, { headers: { Authorization: `Bearer ${token}` } });
      // Filter out locally instead of refetching for speed
      setProducts(prev => prev.filter(p => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = (product: Product) => {
    // If the product has options/variants, we should probably redirect to product page
    // For simplicity here, we direct them to product page so they can choose size/color
    router.push(`/product/${product.slug}`);
  };

  if (!isLoaded || !isSignedIn) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen py-12 bg-muted/20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Heart className="text-primary fill-primary/10" size={28} /> My Wishlist
        </h1>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse bg-background rounded-xl h-80 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-background rounded-xl p-16 text-center border shadow-sm">
            <Heart size={64} className="mx-auto text-muted-foreground opacity-30 mb-6" />
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Save items you love here to keep track of them and buy them later.
            </p>
            <Link href="/shop">
              <Button size="lg">Explore Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-background rounded-xl border overflow-hidden shadow-sm group">
                <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] bg-muted overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">No Image</div>
                  )}
                  
                  {/* Remove Button Overlay */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromWishlist(product._id);
                    }}
                    className="absolute top-3 right-3 h-8 w-8 bg-white/90 dark:bg-black/90 rounded-full flex items-center justify-center text-destructive shadow-sm hover:scale-110 transition-transform z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                </Link>
                
                <div className="p-4">
                  <Link href={`/product/${product.slug}`} className="block">
                    <h3 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-lg">₹{product.price.toFixed(2)}</span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingBag size={16} /> View Options
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
