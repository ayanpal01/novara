'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/axios';
import { Package, Truck, CheckCircle2, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
  size?: string;
  color?: string;
}

interface Order {
  _id: string;
  user: { name: string; email: string };
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  paymentResult?: { id: string; status: string };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  orderStatus: string;
  trackingId?: string;
  createdAt: string;
  orderNumber: string;
  orderItems: OrderItem[];
}

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-8">{error}</p>
        <Button asChild>
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const currentStepIndex = STEPS.indexOf(order.orderStatus.toLowerCase());

  return (
    <div className="bg-muted/20 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 tracking-tight">
              Order #{order.orderNumber || order._id.substring(0, 8).toUpperCase()}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 bg-background shadow-sm">
              <FileText size={16} /> Invoice
            </Button>
          </div>
        </div>

        {/* Animated Status Stepper */}
        <div className="bg-background rounded-2xl p-6 sm:p-10 shadow-sm border mb-8 overflow-hidden">
          <h2 className="text-lg font-semibold mb-8">Tracking Status</h2>
          
          <div className="relative">
            {/* Background Track */}
            <div className="absolute top-5 left-0 w-full h-1 bg-muted rounded-full" />
            
            {/* Active Track (Animated) */}
            <motion.div 
              className="absolute top-5 left-0 h-1 bg-primary rounded-full"
              initial={{ width: '0%' }}
              animate={{ 
                width: currentStepIndex === 0 ? '0%' : 
                       currentStepIndex === 1 ? '33.33%' : 
                       currentStepIndex === 2 ? '66.66%' : '100%' 
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />

            <div className="relative flex justify-between">
              {[
                { key: 'pending', label: 'Placed', icon: Package },
                { key: 'confirmed', label: 'Confirmed', icon: Package },
                { key: 'processing', label: 'Processing', icon: Package },
                { key: 'shipped', label: 'Shipped', icon: Truck },
                { key: 'delivered', label: 'Delivered', icon: CheckCircle2 }
              ].map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isActive = idx === currentStepIndex;
                const Icon = step.icon;

                return (
                    <div key={step.key} className="flex flex-col items-center relative z-10 w-1/5">
                      <motion.div 
                      initial={false}
                      animate={{
                        backgroundColor: isCompleted ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                        color: isCompleted ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                        scale: isActive ? 1.2 : 1
                      }}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-4 border-background transition-colors duration-500",
                        isCompleted ? "shadow-md" : ""
                      )}
                    >
                      <Icon size={16} />
                    </motion.div>
                    <span className={cn(
                      "mt-3 text-xs sm:text-sm font-medium text-center transition-colors duration-500",
                      isActive ? "text-primary font-bold" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tracking Info if Shipped */}
          {order.trackingId && (
            <div className="mt-10 bg-primary/5 rounded-xl p-4 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-primary">
                <Truck className="shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Shipped via Express Courier</p>
                  <p className="text-xs opacity-80">Tracking ID: {order.trackingId}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 bg-background hover:bg-muted">
                Track Package
              </Button>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-background rounded-2xl p-6 sm:p-8 shadow-sm border">
              <h2 className="text-xl font-semibold mb-6 border-b pb-4">Items Summary</h2>
              <div className="space-y-6">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <Link href={`/product/${item.product}`}>
                      <div className="w-20 h-24 sm:w-24 sm:h-32 bg-muted rounded-lg overflow-hidden shrink-0 hover:opacity-80 transition-opacity">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/product/${item.product}`} className="font-semibold text-base sm:text-lg hover:underline line-clamp-1">
                          {item.name}
                        </Link>
                        <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                          {item.size && <p>Size: {item.size}</p>}
                          {item.color && <p>Color: {item.color}</p>}
                        </div>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <p className="text-sm font-medium bg-muted/50 px-2 py-1 rounded">Qty: {item.qty}</p>
                        <p className="font-semibold">${(item.price * item.qty).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Address & Summary */}
          <div className="space-y-8">
            
            <div className="bg-background rounded-2xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4 border-b pb-3">Shipping Address</h2>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{order.shippingAddress.fullName || order.user.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            <div className="bg-background rounded-2xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4 border-b pb-3">Payment Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {order.isPaid ? (
                    <span className="text-green-600 dark:text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded text-xs">Paid</span>
                  ) : (
                    <span className="text-yellow-600 font-semibold bg-yellow-500/10 px-2 py-0.5 rounded text-xs">Unpaid</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-background rounded-2xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4 border-b pb-3">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>₹{order.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹{order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center mt-2">
                  <span className="font-semibold text-base">Total</span>
                  <span className="font-bold text-xl">₹{order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
