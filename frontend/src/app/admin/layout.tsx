'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  MessageSquare,
  Tags,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

const ADMIN_LINKS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, getToken } = useAuth();
  const { isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!isSignedIn) {
          setIsAdmin(false);
          return;
        }
        
        const token = await getToken();
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (data.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };

    if (isLoaded) {
      checkAdmin();
    }
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    if (isAdmin === false) {
      router.replace('/');
    }
  }, [isAdmin, router]);

  if (isAdmin === false) {
    // If we've confirmed they are not admin, render nothing while redirecting
    return null;
  }

  if (isAdmin === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground font-medium animate-pulse">Verifying Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-muted/20">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r bg-background hidden md:flex flex-col flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        <div className="p-6 border-b">
          <h2 className="font-bold tracking-tight">Admin Console</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage your store</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin');
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={18} />
                {link.name}
                {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start gap-2 text-muted-foreground")}>
            <LogOut size={16} /> Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden border-b bg-background p-4 flex items-center justify-between sticky top-16 z-10">
          <h2 className="font-semibold">Admin Console</h2>
          
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg h-9 w-9 hover:bg-muted text-muted-foreground hover:text-foreground">
              <Menu size={20} />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
              <div className="flex flex-col h-full bg-background">
                <div className="p-6 border-b">
                  <h2 className="font-bold tracking-tight">Admin Console</h2>
                  <p className="text-xs text-muted-foreground mt-1">Manage your store</p>
                </div>
                
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {ADMIN_LINKS.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin');
                    
                    return (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon size={18} />
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-4 border-t">
                  <Link href="/" onClick={() => setIsMobileOpen(false)} className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start gap-2 text-muted-foreground")}>
                    <LogOut size={16} /> Exit Admin
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
