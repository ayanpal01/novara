'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center py-20 px-4">
      <div className="bg-white max-w-lg w-full rounded-2xl border shadow-sm p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tight mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for shopping with NOVARA. We've received your order and will notify you as soon as it ships.
        </p>

        {orderId && (
          <div className="bg-muted/30 border border-dashed rounded-xl p-4 mb-8">
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Order Reference</p>
            <p className="font-mono text-lg font-bold mt-1">#{orderId.substring(orderId.length - 8).toUpperCase()}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {orderId && (
            <Button size="lg" className="h-12 w-full font-semibold group" asChild>
              <Link href={`/profile/orders/${orderId}`}>
                View Order Details
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          )}
          <Button variant="outline" size="lg" className="h-12 w-full font-semibold" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
