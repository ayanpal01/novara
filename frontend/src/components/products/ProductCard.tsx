'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Star, Heart, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@clerk/nextjs';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  category?: { name: string; slug: string } | string;
  images: string[];
  rating: number;
  numReviews: number;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { isLoaded, userId } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false); // In a real app, track via global state
  
  const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop';
  const defaultImage = imageError || !product.images || product.images.length === 0 ? PLACEHOLDER_IMAGE : product.images[0];
  const hoverImage = imageError || !product.images || product.images.length < 2 ? defaultImage : product.images[1];

  const categoryName = product.category 
    ? (typeof product.category === 'object' ? product.category.name : 'Category') 
    : 'Fashion';

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100) 
    : 0;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoaded || !userId) {
      // Trigger sign in or alert
      alert('Please sign in to add to wishlist');
      return;
    }
    setIsWishlisted(!isWishlisted);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group flex flex-col"
    >
      <Link href={`/product/${product.slug}`} className="flex-1 relative block">
        <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-lg overflow-hidden mb-4 bg-muted border border-transparent group-hover:border-border transition-colors">
          
          {/* Wishlist Button */}
          <button 
            onClick={toggleWishlist}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-background hover:text-red-500 transition-colors shadow-sm"
            aria-label="Add to Wishlist"
          >
            <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : ""} strokeWidth={1.5} />
          </button>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-20 px-2 py-1 bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase rounded shadow-sm">
              {discountPercent}% OFF
            </div>
          )}

          {/* Default Image */}
          <Image 
            src={defaultImage} 
            alt={product.name} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={() => setImageError(true)}
            className={`absolute inset-0 object-cover transition-opacity duration-500 ${product.images && product.images.length > 1 && !imageError ? 'group-hover:opacity-0' : 'group-hover:scale-105 transition-transform'}`}
          />
          
          {/* Hover Image */}
          {product.images && product.images.length > 1 && !imageError && (
            <Image 
              src={hoverImage} 
              alt={`${product.name} alternate view`} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="absolute inset-0 object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
          )}
          
          {/* Quick Actions overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 flex gap-2">
            <button 
              className="flex-1 bg-background/95 backdrop-blur text-foreground py-2.5 rounded text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm flex items-center justify-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                console.log('Quick View', product._id);
              }}
            >
              <Eye size={16} strokeWidth={1.5} /> <span className="hidden sm:inline">Quick View</span>
            </button>
            <button 
              className="flex-1 bg-foreground/95 backdrop-blur text-background py-2.5 rounded text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm flex items-center justify-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                console.log('Added to cart', product._id);
              }}
            >
              <ShoppingBag size={16} strokeWidth={1.5} /> <span className="hidden sm:inline">Add to Cart</span>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1 truncate">
            {categoryName}
          </span>
          <h3 className="font-medium text-sm sm:text-base mb-1 truncate text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center text-foreground">
              <Star size={12} className="fill-foreground text-foreground" />
              <span className="text-xs font-medium ml-1">{product.rating ? product.rating.toFixed(1) : '0.0'}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">({product.numReviews || 0})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base text-foreground">₹{product.price.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">₹{product.compareAtPrice?.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
