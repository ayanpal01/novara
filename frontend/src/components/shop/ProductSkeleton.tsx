'use client';

export default function ProductSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-lg overflow-hidden mb-4 bg-muted" />
      <div className="flex flex-col">
        <div className="h-3 w-16 bg-muted rounded mb-2" />
        <div className="h-4 w-3/4 bg-muted rounded mb-2" />
        <div className="h-3 w-12 bg-muted rounded mb-2" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
    </div>
  );
}
