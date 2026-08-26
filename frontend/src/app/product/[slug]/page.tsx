'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/axios';
import ProductGallery from '@/components/products/detail/ProductGallery';
import ProductInfo from '@/components/products/detail/ProductInfo';
import ProductReviews from '@/components/products/detail/ProductReviews';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        // Fetch main product
        const { data } = await api.get(`/products/slug/${slug}`);
        setProduct(data);

        // Fetch related products (same category, exclude current)
        if (data.category) {
          const categorySlug = typeof data.category === 'object' ? data.category.slug : undefined;
          let query = '?limit=6';
          if (categorySlug) query += `&category=${categorySlug}`;
          
          const relatedRes = await api.get(`/products${query}`);
          const filtered = relatedRes.data.products
            .filter((p: any) => p._id !== data._id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-[1600px] min-h-[80vh]">
        <div className="h-4 w-64 bg-muted animate-pulse rounded mb-8"></div>
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
          <div className="w-full lg:w-3/5 h-[600px] xl:h-[800px] bg-muted animate-pulse rounded-2xl"></div>
          <div className="w-full lg:w-2/5 space-y-6 pt-4">
            <div className="h-4 bg-muted animate-pulse w-32 rounded"></div>
            <div className="h-10 bg-muted animate-pulse w-3/4 rounded"></div>
            <div className="h-8 bg-muted animate-pulse w-1/4 rounded mb-12"></div>
            
            <div className="h-6 bg-muted animate-pulse w-24 rounded"></div>
            <div className="flex gap-4">
               <div className="h-12 bg-muted animate-pulse w-12 rounded-full"></div>
               <div className="h-12 bg-muted animate-pulse w-12 rounded-full"></div>
            </div>
            
            <div className="h-6 bg-muted animate-pulse w-24 rounded mt-8"></div>
            <div className="grid grid-cols-4 gap-4">
               <div className="h-12 bg-muted animate-pulse rounded-md"></div>
               <div className="h-12 bg-muted animate-pulse rounded-md"></div>
               <div className="h-12 bg-muted animate-pulse rounded-md"></div>
            </div>

            <div className="flex gap-4 mt-12">
               <div className="h-14 bg-muted animate-pulse w-32 rounded-md"></div>
               <div className="h-14 bg-muted animate-pulse flex-1 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-2xl min-h-[70vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-black tracking-tight mb-4 uppercase">Product Not Found</h1>
        <p className="text-muted-foreground text-lg mb-10">
          {error || "The product you're looking for may have been removed or is no longer available."}
        </p>
        <Link href="/shop">
          <button className="px-8 py-4 bg-foreground text-background font-bold uppercase tracking-widest text-sm rounded hover:bg-foreground/90 transition-colors">
            Continue Shopping
          </button>
        </Link>
      </div>
    );
  }

  const categoryName = product.category 
    ? (typeof product.category === 'object' ? product.category.name : 'Category') 
    : 'Shop';
  const categorySlug = product.category 
    ? (typeof product.category === 'object' ? product.category.slug : 'all') 
    : 'all';

  return (
    <div className="bg-background min-h-screen pb-24">
      <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-10 max-w-[1600px]">
        
        {/* Premium Breadcrumb */}
        <nav className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-8 lg:mb-12 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="text-muted/50">/</span>
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <span className="text-muted/50">/</span>
          <Link href={`/shop?category=${categorySlug}`} className="hover:text-foreground transition-colors line-clamp-1">{categoryName}</Link>
          <span className="text-muted/50">/</span>
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20 mb-32 relative">
          
          {/* Left: Gallery (Scrolls normally) */}
          <div className="w-full lg:w-[55%] xl:w-[60%]">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right: Info (Sticky on desktop) */}
          <div className="w-full lg:w-[45%] xl:w-[40%]">
            <ProductInfo product={product} />
          </div>
          
        </div>

        {/* Reviews Section */}
        <div id="reviews-section" className="scroll-mt-32 max-w-6xl mx-auto">
          <ProductReviews productId={product._id} reviews={product.reviews} />
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-16 border-t border-muted/50 max-w-[1600px] mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter mb-2">You May Also Like</h2>
                <p className="text-muted-foreground text-sm lg:text-base">Curated pieces selected for you.</p>
              </div>
              <Link href={`/shop?category=${categorySlug}`} className="hidden sm:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>

            <Link href={`/shop?category=${categorySlug}`} className="sm:hidden mt-8 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors py-4 border border-input rounded">
              View All Collection <ArrowRight size={16} />
            </Link>
          </div>
        )}
        
      </div>
    </div>
  );
}
