'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/contexts/AuthContext';
import MobileMenu from './MobileMenu';
import { useState, useEffect } from 'react';
import { useCartStore, useCartCount } from '@/lib/store';
import CartSheet from '../cart/CartSheet';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const { logout } = useAuth();
  
  const { toggleCart } = useCartStore();
  const cartCount = useCartCount();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        isScrolled || !isHome 
          ? 'bg-background/95 backdrop-blur-md border-b supports-[backdrop-filter]:bg-background/80 py-3 shadow-sm' 
          : 'bg-transparent py-5 border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <span className={`text-2xl font-black tracking-tighter uppercase ${!isScrolled && isHome ? 'text-white' : 'text-foreground'}`}>
                NOVARA
              </span>
            </Link>
            <div className="hidden md:flex gap-8 text-sm font-medium">
              <Link href="/shop?featured=true" className={`transition-colors hover:opacity-70 ${!isScrolled && isHome ? 'text-white' : 'text-foreground'}`}>New In</Link>
              <Link href="/shop/men" className={`transition-colors hover:opacity-70 ${!isScrolled && isHome ? 'text-white' : 'text-foreground'}`}>Men</Link>
              <Link href="/shop/women" className={`transition-colors hover:opacity-70 ${!isScrolled && isHome ? 'text-white' : 'text-foreground'}`}>Women</Link>
              <Link href="/shop/accessories" className={`transition-colors hover:opacity-70 ${!isScrolled && isHome ? 'text-white' : 'text-foreground'}`}>Accessories</Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className={`hidden sm:flex rounded-full hover:bg-black/5 ${!isScrolled && isHome ? 'text-white hover:text-white hover:bg-white/10' : 'text-foreground'}`}>
              <Search className="h-5 w-5" strokeWidth={1.5} />
              <span className="sr-only">Search</span>
            </Button>
            
            {mounted && isLoaded && isSignedIn && (
              <Link 
                href="/wishlist" 
                className={`hidden sm:flex items-center justify-center h-10 w-10 rounded-full hover:bg-black/5 ${!isScrolled && isHome ? 'text-white hover:text-white hover:bg-white/10' : 'text-foreground'}`}
              >
                <Heart className="h-5 w-5" strokeWidth={1.5} />
                <span className="sr-only">Wishlist</span>
              </Link>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className={`relative rounded-full hover:bg-black/5 ${!isScrolled && isHome ? 'text-white hover:text-white hover:bg-white/10' : 'text-foreground'}`}
              onClick={toggleCart}
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
              <span className="sr-only">Cart</span>
              {mounted && cartCount > 0 && (
                <span className={`absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${!isScrolled && isHome ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  {cartCount}
                </span>
              )}
            </Button>

            <div className="hidden sm:flex items-center gap-2 ml-2">
              {!isLoaded ? null : !isSignedIn ? (
                <Link href="/sign-in">
                  <Button variant={!isScrolled && isHome ? "outline" : "default"} className={!isScrolled && isHome ? "bg-transparent text-white border-white hover:bg-white hover:text-black rounded-full" : "rounded-full"}>
                    Sign In
                  </Button>
                </Link>
              ) : (
                <Link href="/profile" className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border border-border overflow-hidden">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold">{user?.fullName?.charAt(0) || user?.primaryEmailAddress?.emailAddress?.charAt(0) || 'U'}</span>
                  )}
                </Link>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden rounded-full ${!isScrolled && isHome ? 'text-white' : 'text-foreground'}`}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>
      
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <CartSheet />
    </nav>
  );
}
