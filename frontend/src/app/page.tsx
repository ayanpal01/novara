'use client';

import AnnouncementBar from '@/components/home/AnnouncementBar';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import NewArrivals from '@/components/home/NewArrivals';
import FeaturedCollection from '@/components/home/FeaturedCollection';
import BestSellers from '@/components/home/BestSellers';
import PromotionalBanner from '@/components/home/PromotionalBanner';
import BenefitsSection from '@/components/home/BenefitsSection';
import NewsletterSection from '@/components/home/NewsletterSection';

export default function Home() {
  return (
    <div className="bg-background flex flex-col min-h-screen">
      <AnnouncementBar />
      <HeroSection />
      <CategorySection />
      <NewArrivals />
      <FeaturedCollection />
      <BestSellers />
      <PromotionalBanner />
      <BenefitsSection />
      <NewsletterSection />
    </div>
  );
}
