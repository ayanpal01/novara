import ShopListing from '@/components/products/ShopListing';
import { Suspense } from 'react';

export default function ShopPage() {
  return (
    <div className="bg-background min-h-screen">
      <Suspense fallback={<div className="container mx-auto py-20 text-center">Loading shop...</div>}>
        <ShopListing />
      </Suspense>
    </div>
  );
}
