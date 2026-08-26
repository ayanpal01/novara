'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import api from '@/lib/axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, Truck, PackageCheck, AlertCircle } from 'lucide-react';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!isSignedIn || !id) return;
      try {
        const token = await getToken();
        const res = await api.get(`/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id, isSignedIn, getToken]);

  if (!isLoaded || !isSignedIn) return null;

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted/20 rounded-xl border" />;
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto text-muted-foreground opacity-50 mb-4" size={48} />
        <h2 className="text-xl font-bold">Order not found</h2>
        <p className="text-muted-foreground mt-2">The order you are looking for does not exist or you do not have permission to view it.</p>
        <Link href="/profile/orders" className="text-primary hover:underline mt-4 inline-block">Back to My Orders</Link>
      </div>
    );
  }

  const statusMap: Record<string, { icon: any, color: string }> = {
    pending: { icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
    confirmed: { icon: CheckCircle2, color: 'text-blue-500 bg-blue-500/10' },
    processing: { icon: Clock, color: 'text-indigo-500 bg-indigo-500/10' },
    shipped: { icon: Truck, color: 'text-violet-500 bg-violet-500/10' },
    delivered: { icon: PackageCheck, color: 'text-emerald-500 bg-emerald-500/10' },
    cancelled: { icon: AlertCircle, color: 'text-destructive bg-destructive/10' },
    returned: { icon: AlertCircle, color: 'text-destructive bg-destructive/10' },
  };

  const currentStatus = statusMap[order.orderStatus] || statusMap.pending;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/profile/orders" className="text-sm text-muted-foreground hover:text-black flex items-center gap-1 w-fit mb-4">
          <ArrowLeft size={14} /> Back to orders
        </Link>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Order #{order.orderNumber}</h2>
            <p className="text-muted-foreground mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-start">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${currentStatus.color}`}>
              <StatusIcon size={14} />
              {order.orderStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Items in your order</h3>
            </div>
            <div className="divide-y">
              {order.orderItems.map((item: any) => (
                <div key={item._id} className="p-6 flex flex-col sm:flex-row gap-6">
                  <div className="w-24 h-32 bg-muted rounded-md overflow-hidden shrink-0 border">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg line-clamp-1">{item.name}</h4>
                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                      {item.attributes && Object.entries(item.attributes).map(([key, val]) => (
                        <p key={key}>{key}: <span className="uppercase">{String(val)}</span></p>
                      ))}
                      {!item.attributes && item.size && <p>Size: <span className="uppercase">{item.size}</span></p>}
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end justify-between">
                    <p className="font-semibold">₹{item.price?.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Details */}
        <div className="space-y-6">
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b">
              <h3 className="font-semibold">Order Summary</h3>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{(order.pricing?.subtotal || order.itemsPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>₹{(order.pricing?.shipping || order.shippingPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{(order.pricing?.tax || order.taxPrice || 0).toFixed(2)}</span>
              </div>
              {((order.pricing?.discount || order.discountPrice) > 0) && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-₹{(order.pricing?.discount || order.discountPrice).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-4 border-t flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>₹{(order.pricing?.total || order.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b">
              <h3 className="font-semibold">Delivery Address</h3>
            </div>
            <div className="p-6 text-sm space-y-1">
              <p className="font-semibold text-base mb-2">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.address || order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress?.addressLine2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
              <p>{order.shippingAddress?.country}</p>
              <p className="pt-2 text-muted-foreground">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b">
              <h3 className="font-semibold">Payment Info</h3>
            </div>
            <div className="p-6 text-sm">
              <p className="flex items-center gap-2">
                <span className="font-medium">Method:</span> 
                {order.paymentMethod === 'Razorpay' ? 'Paid Securely via Razorpay' : order.paymentMethod}
              </p>
              <p className="flex items-center gap-2 mt-2">
                <span className="font-medium">Status:</span> 
                <span className={order.isPaid ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                  {order.isPaid ? 'Paid' : 'Pending'}
                </span>
              </p>
              {order.paymentResult?.razorpay_payment_id && (
                <p className="text-xs text-muted-foreground mt-4 break-all">
                  Txn ID: {order.paymentResult.razorpay_payment_id}
                </p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
