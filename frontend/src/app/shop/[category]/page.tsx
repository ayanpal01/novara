import ShopListing from '@/components/products/ShopListing';
import { Suspense } from 'react';

export default async function CategoryShopPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  
  return (
    <div className="bg-background min-h-screen">
      <Suspense fallback={<div className="container mx-auto py-20 text-center">Loading category...</div>}>
        <ShopListing initialCategory={resolvedParams.category} />
      </Suspense>
    </div>
  );
}
