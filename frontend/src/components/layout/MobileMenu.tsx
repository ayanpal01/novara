'use client';

import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth, useUser } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { logout } = useAuth();
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left font-bold text-2xl tracking-tight">NOVARA</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 mt-12">
          <div className="flex flex-col gap-6 text-2xl font-light tracking-wide">
            <Link href="/" onClick={onClose} className="hover:text-muted-foreground transition-colors">Home</Link>
            <Link href="/shop?featured=true" onClick={onClose} className="hover:text-muted-foreground transition-colors">New In</Link>
            <Link href="/shop/men" onClick={onClose} className="hover:text-muted-foreground transition-colors">Men</Link>
            <Link href="/shop/women" onClick={onClose} className="hover:text-muted-foreground transition-colors">Women</Link>
            <Link href="/shop/accessories" onClick={onClose} className="hover:text-muted-foreground transition-colors">Accessories</Link>
          </div>
          <hr />
            {!isLoaded ? null : !isSignedIn ? (
              <Link href="/sign-in" onClick={onClose}>
                <Button className="w-full justify-start text-lg font-normal rounded-none border-b border-muted pb-4 bg-transparent text-foreground hover:bg-transparent hover:text-muted-foreground px-0" variant="ghost">
                  Sign In / Register
                </Button>
              </Link>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold">{user?.fullName?.charAt(0) || user?.primaryEmailAddress?.emailAddress?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <span className="font-medium text-lg">My Account</span>
                </div>
                <div className="flex flex-col gap-4 text-lg font-light tracking-wide">
                  <Link href="/profile" onClick={onClose} className="hover:text-muted-foreground transition-colors">Profile Details</Link>
                  <Link href="/profile/orders" onClick={onClose} className="hover:text-muted-foreground transition-colors">Order History</Link>
                  <Link href="/wishlist" onClick={onClose} className="hover:text-muted-foreground transition-colors">Wishlist</Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-lg font-light p-0 text-red-500 hover:text-red-600 hover:bg-transparent"
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
      </SheetContent>
    </Sheet>
  );
}
