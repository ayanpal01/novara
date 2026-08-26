'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Maximize2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const defaultImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop';
  const displayImages = images?.length > 0 ? images : [defaultImage];

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* Desktop Thumbnails */}
        <div className="hidden md:flex flex-col gap-4 overflow-y-auto max-h-[800px] w-24 shrink-0 custom-scrollbar pr-2">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative w-full aspect-[3/4] shrink-0 rounded-lg overflow-hidden border-2 transition-all group bg-muted",
                activeIndex === i ? "border-foreground" : "border-transparent hover:border-muted-foreground/50"
              )}
            >
              <img 
                src={imageError[i] ? defaultImage : img} 
                alt={`${productName} thumbnail ${i + 1}`} 
                onError={() => setImageError(prev => ({ ...prev, [i]: true }))}
                className={cn("w-full h-full object-cover transition-transform duration-500", activeIndex !== i && "group-hover:scale-110")} 
              />
              {activeIndex !== i && <div className="absolute inset-0 bg-background/20 group-hover:bg-transparent transition-colors" />}
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div className="relative flex-1 group">
          <div 
            className="relative w-full aspect-[4/5] md:aspect-[3/4] bg-muted rounded-2xl overflow-hidden cursor-crosshair"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setIsModalOpen(true)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 w-full h-full"
              >
                <img 
                  src={imageError[activeIndex] ? defaultImage : displayImages[activeIndex]} 
                  alt={productName} 
                  onError={() => setImageError(prev => ({ ...prev, [activeIndex]: true }))}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-200 ease-out",
                    isZoomed ? "scale-[2]" : "scale-100"
                  )}
                  style={
                    isZoomed 
                      ? { transformOrigin: `${mousePosition.x}% ${mousePosition.y}%` } 
                      : { transformOrigin: 'center center' }
                  }
                />
              </motion.div>
            </AnimatePresence>

            {/* Expand Button */}
            <button 
              className="absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur rounded-full flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background shadow-sm z-10 hidden md:flex"
              onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
            >
              <Maximize2 size={18} />
            </button>
            
            {/* Mobile Navigation Arrows (Visible on swipe usually, but adding buttons for accessibility) */}
            {displayImages.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur rounded-full flex items-center justify-center text-foreground shadow-sm z-10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNext}
                  className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur rounded-full flex items-center justify-center text-foreground shadow-sm z-10"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Mobile Pagination Dots */}
          {displayImages.length > 1 && (
            <div className="flex justify-center gap-2 mt-4 md:hidden">
              {displayImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeIndex === i ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/30"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 m-0 rounded-none border-none bg-background/95 backdrop-blur-sm z-[100]">
          <DialogTitle className="sr-only">Product Image Gallery</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
            <DialogClose className="absolute top-6 right-6 w-12 h-12 bg-background/50 rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors z-50 border border-border">
              <X size={24} />
            </DialogClose>

            <AnimatePresence mode="wait">
              <motion.img 
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={imageError[activeIndex] ? defaultImage : displayImages[activeIndex]} 
                alt={productName}
                className="max-w-full max-h-full object-contain"
              />
            </AnimatePresence>

            {displayImages.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 w-14 h-14 bg-background/50 backdrop-blur rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors border border-border z-10"
                >
                  <ChevronLeft size={32} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 w-14 h-14 bg-background/50 backdrop-blur rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors border border-border z-10"
                >
                  <ChevronRight size={32} strokeWidth={1.5} />
                </button>
              </>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-background/50 backdrop-blur rounded-full border border-border">
              {displayImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    activeIndex === i ? "bg-foreground scale-125" : "bg-muted-foreground/50 hover:bg-muted-foreground"
                  )}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
