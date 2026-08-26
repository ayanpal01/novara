'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const MESSAGES = [
  "FREE SHIPPING ON ORDERS ABOVE ₹999",
  "EASY 7-DAY RETURNS",
  "SECURE PAYMENTS",
  "NEW ARRIVALS AVAILABLE NOW"
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-foreground text-background text-xs font-semibold tracking-widest py-2.5 overflow-hidden flex justify-center items-center">
      <div className="relative h-4 w-full max-w-sm flex justify-center items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute text-center w-full"
          >
            {MESSAGES[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
