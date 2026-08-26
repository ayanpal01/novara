'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Save, Truck, Package, CreditCard, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';

interface OrderItem {
  _id: string;
  name: string;
  qty: number;
  image: string;
  price: number;
  size?: string;
  color?: string;
}

interface Order {
  _id: string;
  user: { name: string; email: string };
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
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
  orderStatus: string;
  paymentStatus: string;
  trackingId?: string;
  createdAt: string;
  orderNumber: string;
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Editable state
  const [status, setStatus] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
      setStatus(data.orderStatus);
      setTrackingId(data.trackingId || '');
    } catch (error) {
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await api.put(`/orders/${id}/status`, { status, trackingId });
      toast.success('Order updated successfully');
      fetchOrder(); // refresh data
    } catch (error) {
      toast.error('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12 animate-pulse">Loading order...</div>;
  if (!order) return <div className="text-center py-12 text-destructive">Order not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders"><ArrowLeft size={20} /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Order #{order.orderNumber || order._id.substring(order._id.length - 8).toUpperCase()}
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                order.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-700' :
                order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
                order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {order.orderStatus}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Items and Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-background rounded-xl border p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold border-b pb-3 flex items-center gap-2">
              <Package size={18} /> Order Items
            </h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item._id} className="flex gap-4 border-b last:border-0 pb-4 last:pb-0">
                  <div className="h-16 w-16 bg-muted rounded-md overflow-hidden shrink-0 border">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>₹{order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (15%)</span>
                <span>₹{order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span>₹{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-background rounded-xl border p-6 shadow-sm">
              <h2 className="font-semibold border-b pb-3 mb-3 flex items-center gap-2">
                <User size={16} /> Customer
              </h2>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{order.shippingAddress.fullName || order.shippingAddress.name}</p>
                <p className="text-muted-foreground">{order.user?.email || 'Guest User'}</p>
                <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-background rounded-xl border p-6 shadow-sm">
              <h2 className="font-semibold border-b pb-3 mb-3 flex items-center gap-2">
                <Truck size={16} /> Shipping Address
              </h2>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{order.shippingAddress.addressLine1 || order.shippingAddress.address}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Admin Actions & Status */}
        <div className="space-y-6">
          {/* Fulfillment Actions */}
          <div className="bg-background rounded-xl border p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold border-b pb-3">Update Order</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Order Status</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Tracking ID</label>
                <Input 
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. FEDEX-123456789"
                />
              </div>

              <Button className="w-full gap-2" onClick={handleUpdate} disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-background rounded-xl border p-6 shadow-sm">
            <h2 className="font-semibold border-b pb-3 mb-4 flex items-center gap-2">
              <CreditCard size={16} /> Payment Info
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                {order.paymentStatus === 'paid' || order.isPaid ? (
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase">Paid</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase">{order.paymentStatus || 'Unpaid'}</span>
                )}
              </div>
              {order.isPaid && order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid On</span>
                  <span>{new Date(order.paidAt).toLocaleDateString()}</span>
                </div>
              )}
              {order.paymentResult && order.paymentResult.id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gateway ID</span>
                  <span className="text-xs font-mono">{order.paymentResult.id}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
