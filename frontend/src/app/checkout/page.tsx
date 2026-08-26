'use client';

import { useEffect, useState } from 'react';
import { useCartStore, useCartTotal } from '@/lib/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Plus, ChevronRight, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';

import AddressCard, { Address } from '@/components/address/AddressCard';
import AddressForm, { AddressFormValues } from '@/components/address/AddressForm';

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCartStore();
  const total = useCartTotal();
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Address states
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent accessing checkout if cart is empty
  useEffect(() => {
    if (mounted && cartItems.length === 0) {
      router.replace('/cart');
    }
  }, [mounted, cartItems, router]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        if (!isSignedIn) return;
        const token = await getToken();
        const res = await api.get('/users/addresses', { headers: { Authorization: `Bearer ${token}` } });
        
        const addresses = res.data || [];
        setSavedAddresses(addresses);
        
        // Auto-select the default address
        const defaultAddr = addresses.find((a: Address) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr._id);
        else if (addresses.length > 0) setSelectedAddressId(addresses[0]._id);
      } catch (err) {
        console.error('Failed to fetch addresses', err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    
    fetchAddresses();
  }, [isSignedIn, getToken]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleAddAddress = async (data: AddressFormValues) => {
    const token = await getToken();
    const res = await api.post('/users/addresses', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const updatedAddresses = res.data;
    setSavedAddresses(updatedAddresses);
    setIsAddingAddress(false);
    
    // Auto-select the newly added address (it will be the last one in the array)
    const newAddr = updatedAddresses[updatedAddresses.length - 1];
    if (newAddr) setSelectedAddressId(newAddr._id);
    
    toast.success('Address added successfully');
  };

  const handlePayment = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to place an order');
      return;
    }

    if (savedAddresses.length > 0 && !selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    if (savedAddresses.length === 0) {
      toast.error('Please add a delivery address first');
      setIsAddingAddress(true);
      return;
    }

    const selectedAddress = savedAddresses.find(a => a._id === selectedAddressId);
    if (!selectedAddress) return;

    try {
      setIsProcessing(true);
      const token = await getToken();
      
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item._id, // legacy/fallback
          variantId: item.variant?._id,
          qty: item.qty,
        })),
        shippingAddress: selectedAddress,
      };

      const { data } = await api.post('/orders/create-payment-order', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { dbOrderId, razorpayOrderId, amount, currency } = data;

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Razorpay SDK failed to load. Are you offline?');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TPVVuLNXh0rHzI', // Fallback for dev
        amount: amount.toString(),
        currency: currency,
        name: 'NOVARA Fashion',
        description: `Order #${dbOrderId}`,
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            await api.post('/orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: dbOrderId
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Order placed successfully!');
            clearCart();
            router.push(`/checkout/success?order=${dbOrderId}`);
          } catch (err: any) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
            router.push(`/profile/orders/${dbOrderId}`); // Go to order page even if failed, it's pending
          }
        },
        prefill: {
          name: user?.fullName || selectedAddress.name || '',
          email: user?.primaryEmailAddress?.emailAddress || '',
          contact: selectedAddress.phone || '',
        },
        theme: {
          color: '#000000',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any) {
        toast.error('Payment failed or was cancelled');
        setIsProcessing(false);
      });

      paymentObject.open();

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
      setIsProcessing(false);
    }
  };

  if (!mounted || cartItems.length === 0) return null;

  // Optimistic totals (backend is source of truth, this is just for display)
  const shippingPrice = total > 1000 ? 0 : 50;
  const taxPrice = Number((0.15 * total).toFixed(2));
  const grandTotal = total + shippingPrice + taxPrice;

  const selectedAddressObj = savedAddresses.find(a => a._id === selectedAddressId);

  return (
    <div className="bg-[#fcfcfc] min-h-screen">
      {/* Premium Minimal Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <Link href="/" className="font-black text-2xl tracking-tighter">NOVARA</Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock size={14} />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-6xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Main Checkout Flow */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Delivery Information */}
            <section>
              <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs">1</span>
                Delivery Information
              </h2>
              
              {!isSignedIn ? (
                <div className="bg-white p-6 border rounded-xl shadow-sm text-center">
                  <p className="text-muted-foreground mb-4">Please sign in to proceed with checkout.</p>
                  <Button asChild>
                    <Link href="/sign-in?redirect_url=/checkout">Sign In</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {loadingAddresses ? (
                    <div className="h-48 bg-muted/20 animate-pulse rounded-xl border" />
                  ) : (
                    <>
                      {/* Saved Addresses List */}
                      {savedAddresses.length > 0 && !isAddingAddress && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            {savedAddresses.map(addr => (
                              <AddressCard
                                key={addr._id}
                                address={addr}
                                selectable={true}
                                isSelected={selectedAddressId === addr._id}
                                onSelect={(a) => setSelectedAddressId(a._id)}
                              />
                            ))}
                          </div>
                          
                          <Button variant="outline" className="w-full h-12 border-dashed" onClick={() => setIsAddingAddress(true)}>
                            <Plus size={16} className="mr-2" /> Add a new address
                          </Button>
                        </div>
                      )}

                      {/* Add New Address Form */}
                      {(savedAddresses.length === 0 || isAddingAddress) && (
                        <AddressForm 
                          isFirstAddress={savedAddresses.length === 0}
                          onSubmit={handleAddAddress}
                          onCancel={() => setIsAddingAddress(false)}
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </section>

            {/* Payment Section */}
            <section className={!selectedAddressId || isAddingAddress ? 'opacity-50 pointer-events-none' : ''}>
              <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs">2</span>
                Payment
              </h2>
              
              <div className="bg-white p-6 border rounded-xl shadow-sm">
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/10 mb-6">
                  <div className="w-12 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-xs">Rz</div>
                  <div>
                    <h4 className="font-semibold">Razorpay Secure</h4>
                    <p className="text-xs text-muted-foreground">UPI, Credit/Debit Cards, NetBanking</p>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment} 
                  size="lg" 
                  className="w-full text-base h-14 font-semibold group" 
                  disabled={isProcessing || !isSignedIn || !selectedAddressId || isAddingAddress}
                >
                  {isProcessing ? 'Processing...' : 'Pay Securely'} 
                  {!isProcessing && <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                </Button>
                
                <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} /> 100% Secure Payment Encrypted via Razorpay
                </p>
              </div>
            </section>

          </div>

          {/* Sticky Order Summary Column */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border lg:sticky lg:top-8">
              
              {/* If an address is selected, show a compact snapshot above summary */}
              {selectedAddressObj && !isAddingAddress && (
                <div className="mb-6 pb-6 border-b border-dashed">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deliver To</h3>
                    <button onClick={() => {
                        setIsAddingAddress(false);
                        const addressesEl = document.getElementById('delivery-section');
                        if (addressesEl) addressesEl.scrollIntoView({ behavior: 'smooth' });
                      }} 
                      className="text-xs font-semibold underline text-primary"
                    >
                      Change
                    </button>
                  </div>
                  <p className="font-semibold text-sm">{selectedAddressObj.name}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{selectedAddressObj.address}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{selectedAddressObj.city}, {selectedAddressObj.pincode}</p>
                </div>
              )}

              <h2 className="text-lg font-bold tracking-tight mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map(item => (
                  <div key={`${item._id}-${item.variant?._id || 'base'}`} className="flex gap-4 group">
                    <div className="w-20 h-24 rounded-md overflow-hidden bg-muted shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        {item.variant?.attributes && Object.entries(item.variant.attributes).map(([key, val]) => (
                          <p key={key}>{key}: <span className="uppercase">{String(val)}</span></p>
                        ))}
                        {!item.variant && item.size && <p>Size: <span className="uppercase">{item.size}</span></p>}
                        <p>Qty: {item.qty}</p>
                      </div>
                      <div className="font-semibold text-sm mt-2">₹{(item.price * item.qty).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Tax</span>
                  <span className="font-medium">₹{taxPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-black/10 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-base">Total</span>
                <div className="text-right">
                  <span className="font-black text-2xl tracking-tight">₹{grandTotal.toFixed(2)}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Includes taxes & duties</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
