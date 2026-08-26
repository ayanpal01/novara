'use client';

interface ProductPriceProps {
  price: number;
  compareAtPrice?: number;
}

export default function ProductPrice({ price, compareAtPrice }: ProductPriceProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount 
    ? Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100) 
    : 0;

  return (
    <div className="flex items-center gap-4">
      <span className="text-3xl font-bold tracking-tight text-foreground">
        ₹{price.toLocaleString()}
      </span>
      {hasDiscount && (
        <>
          <span className="text-xl text-muted-foreground line-through decoration-muted-foreground/50">
            ₹{compareAtPrice?.toLocaleString()}
          </span>
          <span className="px-2.5 py-1 bg-red-600/10 text-red-600 text-xs font-bold tracking-wider uppercase rounded-md">
            {discountPercent}% OFF
          </span>
        </>
      )}
    </div>
  );
}
