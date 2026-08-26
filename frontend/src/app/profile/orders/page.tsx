'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import api from '@/lib/axios';
import Link from 'next/link';
import { Package, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MyOrdersPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isSignedIn) return;
      try {
        const token = await getToken();
        const res = await api.get('/orders/my', { headers: { Authorization: `Bearer ${token}` } });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [isSignedIn, getToken]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">My Orders</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-xl border" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <Package className="mx-auto text-muted-foreground opacity-30 mb-4" size={48} />
          <h3 className="font-semibold text-lg mb-2">No orders found</h3>
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
          <Button asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border rounded-xl p-4 sm:p-6 transition-all hover:border-black/30">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Order <span className="font-semibold text-black">#{order.orderNumber}</span>
                  </p>
                  <p className="text-sm">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-muted text-xs font-semibold uppercase tracking-wider w-fit">
                    {order.orderStatus}
                  </span>
                  <p className="font-semibold">Total: ₹{order.pricing?.total?.toFixed(2) || order.totalPrice?.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {order.orderItems.slice(0, 3).map((item: any) => (
                    <div key={item._id} className="w-12 h-16 bg-muted rounded overflow-hidden shrink-0 border">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="w-12 h-16 bg-muted/50 rounded border flex items-center justify-center text-xs font-medium text-muted-foreground">
                      +{order.orderItems.length - 3}
                    </div>
                  )}
                </div>
                
                <Button variant="outline" size="sm" className="shrink-0 group" asChild>
                  <Link href={`/profile/orders/${order._id}`}>
                    Details <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
