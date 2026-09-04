'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';;
import { LayoutDashboard, MapPin, Package, Heart, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Overview', href: '/profile', icon: LayoutDashboard },
  { name: 'My Orders', href: '/profile/orders', icon: Package },
  { name: 'Addresses', href: '/profile/addresses', icon: MapPin },
  { name: 'Wishlist', href: '/wishlist', icon: Heart },
  { name: 'Settings', href: '/profile/settings', icon: Settings },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="bg-[#fcfcfc] min-h-screen pt-8 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-black tracking-tight mb-8">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Navigation Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            {/* Mobile Horizontal Scroll */}
            <nav className="flex md:flex-col overflow-x-auto custom-scrollbar md:overflow-visible gap-2 md:gap-1 pb-4 md:pb-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/profile' && pathname.startsWith(item.href));
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive 
                        ? 'bg-black text-white' 
                        : 'text-muted-foreground hover:bg-black/5 hover:text-black'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="hidden md:block w-full h-px bg-border my-4" />
              
              <button 
                onClick={() => logout()}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap text-destructive hover:bg-destructive/10 transition-colors text-left"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </aside>
          
          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
