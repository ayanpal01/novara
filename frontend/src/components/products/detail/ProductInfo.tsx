'use client';

import { useState, useMemo, useEffect } from 'react';
import { Star, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/lib/store';

import ProductPrice from './ProductPrice';
import QuantitySelector from './QuantitySelector';
import ProductVariantSelector from './ProductVariantSelector';
import AddToCartSection from './AddToCartSection';
import ProductAccordion from './ProductAccordion';
import { cn } from '@/lib/utils';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  images: string[];
  stock: number;
  category?: { name: string; slug: string } | string;
  
  // Dynamic Options & Variants
  options?: Array<{ name: string; values: Array<{ label: string; value: string; hex?: string }> }>;
  variants?: Array<{
    _id: string;
    attributes: Record<string, string>;
    price?: number;
    compareAtPrice?: number;
    inventory: { quantity: number; trackInventory: boolean };
    isActive: boolean;
  }>;
  
  rating: number;
  numReviews: number;
}

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  // Global cart state
  const { addItem, setIsOpen } = useCartStore();

  // Local state
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Initialize default options
  useEffect(() => {
    if (product.options && product.options.length > 0) {
      const defaults: Record<string, string> = {};
      product.options.forEach(opt => {
        if (opt.values && opt.values.length > 0) {
          defaults[opt.name] = opt.values[0].value;
        }
      });
      setSelectedOptions(defaults);
    }
  }, [product.options]);

  // Find matching variant based on selected options
  const activeVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    if (Object.keys(selectedOptions).length === 0) return null;

    return product.variants.find(variant => {
      if (!variant.attributes) return false;
      // Check if all selected options match the variant's attributes
      return Object.entries(selectedOptions).every(([key, value]) => {
        // Handle case-insensitive keys just in case (Size vs size)
        const variantAttrKey = Object.keys(variant.attributes).find(k => k.toLowerCase() === key.toLowerCase());
        return variantAttrKey && String(variant.attributes[variantAttrKey]).toLowerCase() === String(value).toLowerCase();
      });
    });
  }, [selectedOptions, product.variants]);

  // Derived state
  const currentStock = activeVariant 
    ? (activeVariant.isActive ? activeVariant.inventory.quantity : 0)
    : product.stock;
    
  const isOutOfStock = currentStock === 0;
  
  const displayPrice = activeVariant?.price || product.price;
  const displayComparePrice = activeVariant?.compareAtPrice || product.compareAtPrice;

  // Verify availability for a specific option value combination
  const getIsAvailable = (optionName: string, value: string) => {
    if (!product.variants || product.variants.length === 0) return true;
    
    // Fallback: If the database has variants but none of them have any attributes defined, 
    // we assume all options are available to prevent the UI from disabling everything.
    const hasAnyAttributes = product.variants.some(v => v.attributes && Object.keys(v.attributes).length > 0);
    if (!hasAnyAttributes) return true;

    // Check if there is ANY active variant with this option + value that has stock
    // A stricter check would also enforce currently selected *other* options
    return product.variants.some(variant => {
      if (!variant.attributes) return false;
      const variantAttrKey = Object.keys(variant.attributes).find(k => k.toLowerCase() === optionName.toLowerCase());
      if (variantAttrKey && String(variant.attributes[variantAttrKey]).toLowerCase() === String(value).toLowerCase()) {
        return variant.isActive && (variant.inventory?.quantity > 0 || !variant.inventory);
      }
      return false;
    });
  };

  const handleSelectOption = (name: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [name]: value }));
    setQuantity(1); // Reset quantity when variant changes
  };

  const handleAddToCart = () => {
    // Check if options exist but none selected (shouldn't happen with defaults, but safe guard)
    if (product.options && product.options.length > 0) {
      const missingOptions = product.options.filter(opt => !selectedOptions[opt.name]);
      if (missingOptions.length > 0) {
        toast.error(`Please select ${missingOptions.map(o => o.name).join(', ')}`);
        return;
      }
    }

    if (isOutOfStock) {
      toast.error('This item is currently out of stock');
      return;
    }

    setIsAdding(true);
    
    setTimeout(() => {
      addItem({
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: displayPrice,
        image: product.images?.[0] || '',
        // For backwards compatibility with cart, map the first two options to size/color if they exist
        size: selectedOptions['Size'] || selectedOptions['size'] || '',
        color: selectedOptions['Color'] || selectedOptions['color'] || '',
        variant: activeVariant ? {
          _id: activeVariant._id,
          sku: (activeVariant as any).sku, // sku might not be in the local interface but it's on the backend
          attributes: activeVariant.attributes
        } : undefined,
        qty: quantity,
        stock: currentStock,
      });

      setIsAdding(false);
      setIsAdded(true);
      toast.success('Added to bag!');
      setIsOpen(true);
      
      setTimeout(() => setIsAdded(false), 2000);
    }, 400);
  };

  const categoryName = product.category 
    ? (typeof product.category === 'object' ? product.category.name : 'Category') 
    : 'Fashion';

  // Determine button text
  let buttonText = 'Add to Bag';
  if (product.options?.some(opt => !selectedOptions[opt.name])) {
    const missing = product.options.find(opt => !selectedOptions[opt.name])?.name;
    buttonText = `Select ${missing}`;
  } else if (isOutOfStock) {
    buttonText = 'Out of Stock';
  }

  return (
    <div className="flex flex-col lg:sticky lg:top-24 h-fit pb-12 lg:pb-0">
      
      <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
        {categoryName}
      </span>
      
      <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tighter text-foreground leading-tight">
        {product.name}
      </h1>
      
      <div className="flex items-center gap-4 mb-6 cursor-pointer group" onClick={() => {
        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
      }}>
        <div className="flex items-center gap-1 text-foreground">
          <Star size={16} className="fill-foreground text-foreground" />
          <span className="font-bold">{product.rating ? product.rating.toFixed(1) : '0.0'}</span>
        </div>
        <span className="text-sm font-medium text-muted-foreground underline-offset-4 group-hover:underline transition-all">
          {product.numReviews} Reviews
        </span>
      </div>

      <div className="mb-8">
        <ProductPrice price={displayPrice} compareAtPrice={displayComparePrice} />
      </div>

      <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-xl">
        {product.description}
      </p>

      {/* Dynamic Options */}
      {product.options && product.options.length > 0 && (
        <div className="mb-8">
          <ProductVariantSelector 
            options={product.options}
            selectedOptions={selectedOptions}
            onSelectOption={handleSelectOption}
            getIsAvailable={getIsAvailable}
          />
        </div>
      )}

      {/* Stock Warning */}
      <div className="h-6 mb-4">
        <AnimatePresence mode="wait">
          {currentStock > 0 && currentStock <= 5 && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm font-bold text-orange-600 flex items-center gap-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Only {currentStock} left in stock - order soon
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Purchase Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-stretch">
        <QuantitySelector 
          quantity={quantity} 
          setQuantity={setQuantity} 
          max={currentStock || 1} 
          disabled={isOutOfStock}
        />
        
        <div className="flex-1 w-full">
          <AddToCartSection 
            onAdd={handleAddToCart}
            isAdding={isAdding}
            isAdded={isAdded}
            disabled={isOutOfStock}
            buttonText={buttonText}
            isWishlisted={isWishlisted}
            onToggleWishlist={() => setIsWishlisted(!isWishlisted)}
          />
        </div>
      </div>

      {/* Trust Section */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-10 text-sm font-medium text-muted-foreground border-y py-4">
        <div className="flex items-center gap-2"><Truck size={16} /> Free shipping over ₹999</div>
        <div className="flex items-center gap-2"><RefreshCcw size={16} /> Easy 7-day returns</div>
        <div className="flex items-center gap-2"><ShieldCheck size={16} /> Secure payments</div>
      </div>

      {/* Details Accordion */}
      <ProductAccordion description={product.description} />
      
    </div>
  );
}
