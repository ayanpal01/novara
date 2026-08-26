'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import api from '@/lib/axios';
import Link from 'next/link';
import { Package, MapPin, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfileOverview() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [stats, setStats] = useState({ orders: 0, addresses: 0 });
  const [recentOrder, setRecentOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      if (!isSignedIn) return;
      try {
        const token = await getToken();
        
        // Fetch addresses count
        const userRes = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        const addressCount = userRes.data.addresses?.length || 0;
        
        // Fetch recent orders
        const ordersRes = await api.get('/orders/my', { headers: { Authorization: `Bearer ${token}` } });
        const orderCount = ordersRes.data.length || 0;
        const latestOrder = ordersRes.data[0] || null;

        setStats({ orders: orderCount, addresses: addressCount });
        setRecentOrder(latestOrder);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOverviewData();
  }, [isSignedIn, getToken]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.firstName || 'User'}!</h2>
        <p className="text-muted-foreground mt-1">Manage your account settings, orders, and addresses.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/profile/orders" className="bg-white p-6 rounded-xl border hover:border-black transition-colors group">
          <Package className="mb-4 text-muted-foreground group-hover:text-black transition-colors" size={24} />
          <h3 className="font-semibold text-lg">Orders</h3>
          <p className="text-sm text-muted-foreground">{stats.orders} total orders</p>
        </Link>
        <Link href="/profile/addresses" className="bg-white p-6 rounded-xl border hover:border-black transition-colors group">
          <MapPin className="mb-4 text-muted-foreground group-hover:text-black transition-colors" size={24} />
          <h3 className="font-semibold text-lg">Addresses</h3>
          <p className="text-sm text-muted-foreground">{stats.addresses} saved addresses</p>
        </Link>
        <Link href="/wishlist" className="bg-white p-6 rounded-xl border hover:border-black transition-colors group">
          <Heart className="mb-4 text-muted-foreground group-hover:text-black transition-colors" size={24} />
          <h3 className="font-semibold text-lg">Wishlist</h3>
          <p className="text-sm text-muted-foreground">View your saved items</p>
        </Link>
      </div>

      {loading ? (
        <div className="h-48 bg-muted/20 animate-pulse rounded-xl border" />
      ) : recentOrder ? (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b bg-muted/5">
            <div>
              <h3 className="font-semibold">Recent Order</h3>
              <p className="text-sm text-muted-foreground">Placed on {new Date(recentOrder.createdAt).toLocaleDateString()}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/profile/orders/${recentOrder._id}`}>
                View Details <ArrowRight size={14} className="ml-2" />
              </Link>
            </Button>
          </div>
          <div className="p-6">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-20 bg-muted rounded overflow-hidden shrink-0">
                {recentOrder.orderItems?.[0]?.image && (
                  <img src={recentOrder.orderItems[0].image} alt="Product" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm line-clamp-1">{recentOrder.orderItems?.[0]?.name}</p>
                {recentOrder.orderItems?.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-1">+{recentOrder.orderItems.length - 1} more items</p>
                )}
                <p className="text-sm font-medium mt-2">Total: ₹{recentOrder.pricing?.total?.toFixed(2) || recentOrder.totalPrice?.toFixed(2)}</p>
              </div>
              <div className="ml-auto text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-muted text-xs font-semibold uppercase tracking-wider">
                  {recentOrder.orderStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted/10 border border-dashed rounded-xl p-8 text-center">
          <Package className="mx-auto text-muted-foreground opacity-30 mb-4" size={32} />
          <h3 className="font-medium mb-1">No orders yet</h3>
          <p className="text-sm text-muted-foreground mb-4">When you place an order, it will appear here.</p>
          <Button asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
