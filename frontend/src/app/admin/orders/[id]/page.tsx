'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Save, Truck, User, MapPin, Package, 
  CreditCard, Clock, Copy, Printer, CheckCircle2, 
  AlertTriangle, XCircle, MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const VariantBadge = ({ label, value }: { label: string, value: string }) => {
  const isColor = label.toLowerCase() === 'color' || label.toLowerCase() === 'colour';
  const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(value);
  
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 border border-border/50 text-xs text-muted-foreground font-medium">
      {isColor && (
        <span 
          className="w-2.5 h-2.5 rounded-full border shadow-sm" 
          style={{ backgroundColor: isHex ? value : value.toLowerCase() }}
        />
      )}
      <span>{label}:</span> <span className="text-foreground capitalize">{value}</span>
    </span>
  );
};

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states for edits
  const [status, setStatus] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [courier, setCourier] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = await getToken();
        const { data } = await api.get(`/admin/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(data);
        setStatus(data.orderStatus);
        setTrackingId(data.tracking?.trackingId || data.trackingId || '');
        setCourier(data.tracking?.courier || '');
        setAdminNotes(data.adminNotes || '');
      } catch (error) {
        toast.error('Failed to load order details');
        router.push('/admin/orders');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id, getToken, router]);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const token = await getToken();
      
      const updateData = {
        status: pendingStatus || status,
        trackingId,
        courier,
        adminNotes
      };
      
      const { data } = await api.put(`/admin/orders/${id}/status`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrder(data);
      setStatus(data.orderStatus);
      setShowConfirm(false);
      toast.success('Order status updated successfully.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const onStatusChangeRequest = (newStatus: string) => {
    if (newStatus === status) return;
    setPendingStatus(newStatus);
    setShowConfirm(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!order) return null;

  const isCancelledOrDelivered = order.orderStatus === 'cancelled' || order.orderStatus === 'delivered';
  
  // Delivery Validation
  const maxDeliveryRadius = 20; // km
  const isOutsideRadius = order.deliveryDistance && order.deliveryDistance > maxDeliveryRadius;

  // Pricing
  const subtotal = order.pricing?.subtotal || order.itemsPrice || 0;
  const shipping = order.pricing?.shipping || order.shippingPrice || 0;
  const discount = order.pricing?.discount || order.discountPrice || 0;
  const tax = order.pricing?.tax || order.taxPrice || 0;
  const grandTotal = order.pricing?.total || order.totalPrice || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 bg-gray-50/30 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-white p-6 border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-start gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon" className="shrink-0 -ml-2">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">Order #{order.orderNumber}</h1>
              <button onClick={() => copyToClipboard(order.orderNumber)} className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Copy Order ID">
                <Copy size={14} />
              </button>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              Placed on: <span className="font-medium text-foreground">{new Date(order.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider ${
            order.isPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {order.isPaid ? 'Paid' : 'Unpaid'}
          </span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
            {order.orderStatus.replace(/_/g, ' ')}
          </span>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 ml-2" onClick={() => window.print()}>
            <Printer size={14} /> Print Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-4 sm:px-6 mt-6">
        
        {/* LEFT COLUMN: ~65% */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Order Items */}
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Package size={18} className="text-muted-foreground" /> Order Items
              </h2>
              <span className="text-sm text-muted-foreground font-medium">{order.orderItems.length} items</span>
            </div>
            <div className="p-6 space-y-6">
              {order.orderItems.map((item: any) => (
                <div key={item._id} className="flex gap-5 pb-6 border-b last:border-0 last:pb-0">
                  <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 border">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link href={`/product/${item.product}`} className="font-semibold text-base hover:text-primary transition-colors line-clamp-1">
                          {item.productName || item.name}
                        </Link>
                        {item.sku && <p className="text-xs text-muted-foreground font-mono mt-0.5">SKU: {item.sku}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{(item.price * item.qty).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">₹{item.price.toFixed(2)} / each</p>
                      </div>
                    </div>
                    
                    {/* Dynamic Variant Attributes */}
                    <div className="mt-auto pt-3">
                      <div className="flex flex-wrap gap-2">
                        {item.attributes && Object.keys(item.attributes).length > 0 ? (
                          Object.entries(item.attributes).map(([key, val]) => (
                            <VariantBadge key={key} label={key} value={String(val)} />
                          ))
                        ) : (
                          // Fallback to legacy size/color if attributes object is missing/empty
                          <>
                            {item.size && <VariantBadge label="Size" value={item.size} />}
                            {item.color && <VariantBadge label="Color" value={item.color} />}
                          </>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 border border-gray-200 text-xs text-gray-700 font-semibold ml-auto">
                          Qty: {item.qty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Price Breakdown */}
            <div className="bg-gray-50/50 p-6 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'Free'}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-green-600">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base pt-3 border-t mt-1">
                <span className="font-bold">Grand Total</span>
                <span className="font-black text-lg">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50/50">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Clock size={18} className="text-muted-foreground" /> Order Timeline
              </h2>
            </div>
            <div className="p-6">
              <div className="relative border-l border-gray-200 ml-3 space-y-8">
                {order.orderStatusHistory?.map((history: any, idx: number) => {
                  const isLast = idx === order.orderStatusHistory.length - 1;
                  return (
                    <div key={idx} className="relative pl-6">
                      <span className="absolute -left-2.5 top-0.5 bg-white">
                        {isLast && !isCancelledOrDelivered ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-white">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          </span>
                        ) : (
                          <CheckCircle2 size={20} className="text-green-500 bg-white" />
                        )}
                      </span>
                      <div className="-mt-1">
                        <p className="text-sm font-bold text-gray-900 capitalize">{history.status.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                          {new Date(history.changedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', hour12: true })}
                        </p>
                        {history.note && (
                          <p className="text-sm mt-2 text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                            {history.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {!order.orderStatusHistory?.length && <p className="text-sm text-muted-foreground text-center py-4">No history recorded.</p>}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ~35% */}
        <div className="space-y-6">
          
          {/* Admin Actions */}
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50/50">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Save size={18} className="text-muted-foreground" /> Admin Actions
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Order Status</label>
                <select 
                  value={status} 
                  onChange={(e) => onStatusChangeRequest(e.target.value)}
                  disabled={isCancelledOrDelivered}
                  className="w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:bg-gray-50 font-medium"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {(status === 'shipped' || status === 'out_for_delivery' || status === 'delivered') && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Courier Partner</label>
                    <input 
                      value={courier} 
                      onChange={(e) => setCourier(e.target.value)}
                      disabled={isCancelledOrDelivered}
                      placeholder="e.g. BlueDart"
                      className="w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Tracking ID</label>
                    <input 
                      value={trackingId} 
                      onChange={(e) => setTrackingId(e.target.value)}
                      disabled={isCancelledOrDelivered}
                      placeholder="Tracking Number"
                      className="w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50" 
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Internal Notes</label>
                <textarea 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add a private note about this order..."
                  className="w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[80px]" 
                />
              </div>

              <Button onClick={handleUpdate} disabled={saving || (status === order.orderStatus && courier === (order.tracking?.courier||'') && trackingId === (order.tracking?.trackingId||'') && adminNotes === (order.adminNotes||''))} className="w-full gap-2 font-bold shadow-sm">
                <Save size={16} /> {saving ? 'Saving...' : 'Update Details'}
              </Button>
              
              {isCancelledOrDelivered && (
                <div className="bg-gray-50 p-3 rounded-md text-center border">
                  <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={14} className={order.orderStatus === 'delivered' ? 'text-green-500' : 'text-red-500'} />
                    Order is {order.orderStatus} and locked.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 mb-4">
              <User size={16} /> Customer
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                {(order.user?.name || 'G').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{order.user ? order.user.name : 'Guest Customer'}</p>
                <p className="text-sm text-muted-foreground">{order.user?.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-gray-900">{order.user?.phone || order.shippingAddress.phone}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Delivery Info */}
          <div className="bg-white border rounded-xl shadow-sm p-6 relative overflow-hidden">
            {isOutsideRadius && (
              <div className="absolute top-0 left-0 w-1 bg-red-500 h-full" />
            )}
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 mb-4">
              <MapPin size={16} /> Shipping Address
            </h2>
            
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-bold text-gray-900 mb-1">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="pt-2 font-medium">📞 {order.shippingAddress.phone}</p>
            </div>

            <div className="mt-4 pt-4 border-t space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Delivery Information</h3>
              
              {isOutsideRadius ? (
                <div className="bg-red-50 border border-red-100 rounded-md p-3">
                  <p className="text-xs font-bold text-red-800 flex items-center gap-1.5 mb-1">
                    <AlertTriangle size={14} /> OUTSIDE DELIVERY AREA
                  </p>
                  <p className="text-xs text-red-600 font-medium">
                    Distance: {order.deliveryDistance} km (Max: {maxDeliveryRadius} km)
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-100 rounded-md p-3">
                  <p className="text-xs font-bold text-green-800 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 size={14} /> Delivery Available
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    Distance: {order.deliveryDistance || '?'} km (Max: {maxDeliveryRadius} km)
                  </p>
                </div>
              )}
              
              {order.estimatedDeliveryDate && (
                <div className="flex justify-between text-sm mt-3 pt-3 border-t border-gray-100">
                  <span className="text-muted-foreground">Est. Delivery</span>
                  <span className="font-semibold">{new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 mb-4">
              <CreditCard size={16} /> Payment Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Method</span>
                <span className="font-bold px-2 py-1 bg-gray-100 rounded text-xs">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Razorpay'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-bold capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentResult?.razorpay_payment_id && (
                <div className="pt-3 border-t mt-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Transaction ID</p>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
                    <p className="font-mono text-xs truncate max-w-[200px] text-gray-700">{order.paymentResult.razorpay_payment_id}</p>
                    <button onClick={() => copyToClipboard(order.paymentResult.razorpay_payment_id)} className="text-gray-400 hover:text-gray-700 ml-2">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-2">Change Order Status?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to change the status from <strong className="capitalize">{status}</strong> to <strong className="capitalize">{pendingStatus}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setShowConfirm(false); setPendingStatus(''); }}>Cancel</Button>
              <Button onClick={() => { setStatus(pendingStatus); setShowConfirm(false); handleUpdate(); }}>Confirm Update</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
