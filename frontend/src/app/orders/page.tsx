'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { Package, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

interface Order {
  _id: string;
  totalPrice: number;
  orderStatus: string;
  isPaid: boolean;
  createdAt: string;
  orderItems: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Package /> My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
            <Package size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't made your first purchase.</p>
            <Button asChild>
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-card border rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                <div className="bg-muted/50 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
                  <div className="grid grid-cols-2 sm:flex sm:gap-12 gap-y-4 text-sm">
                    <div>
                      <p className="text-muted-foreground font-medium mb-1">Order Placed</p>
                      <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium mb-1">Total</p>
                      <p className="font-semibold">₹{order.totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-muted-foreground font-medium mb-1">Order #</p>
                      <p className="font-mono text-xs sm:text-sm">{order.orderNumber || order._id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-between sm:justify-end border-t pt-4 sm:pt-0 sm:border-0 mt-2 sm:mt-0">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider", getStatusColor(order.orderStatus))}>
                      {order.orderStatus}
                    </span>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <Link href={`/order/${order._id}`}>
                        View Details <ArrowRight size={14} />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="p-4 sm:px-6">
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="w-20 shrink-0">
                        <Link href={`/product/${item.product}`}>
                          <div className="aspect-[3/4] bg-muted rounded-md overflow-hidden relative group">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            {item.qty > 1 && (
                              <div className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm text-[10px] font-bold px-1.5 py-0.5 rounded">
                                x{item.qty}
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
