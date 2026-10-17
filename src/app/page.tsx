'use client';

import React from 'react';
import { useCafe } from '@/context/CafeContext';
import dynamic from 'next/dynamic';
import CinematicLoader from '@/components/common/CinematicLoader';
import CustomCursor from '@/components/common/CustomCursor';
import AnnouncementTicker from '@/components/common/AnnouncementTicker';
import SoundscapePlayer from '@/components/common/SoundscapePlayer';
import Toast from '@/components/common/Toast';
import CinematicAtmosphere from '@/components/common/CinematicAtmosphere';
import CinematicReveal from '@/components/common/CinematicReveal';
import SmoothScroll from '@/components/common/SmoothScroll';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// three.js is large — load it after the page is interactive instead of blocking first paint.
const CinematicCoffeeCanvas = dynamic(() => import('@/components/canvas/CinematicCoffeeCanvas'), { ssr: false });

// Sections
import HeroSection from '@/components/sections/HeroSection';
import RoasteryStorySection from '@/components/sections/RoasteryStorySection';
import CuppingWheelSection from '@/components/sections/CuppingWheelSection';
import MenuSection from '@/components/sections/MenuSection';
import LiveAtmosphereSection from '@/components/sections/LiveAtmosphereSection';
import TableBookingSection from '@/components/sections/TableBookingSection';
import ReviewsSection from '@/components/sections/ReviewsSection';
import LocationSection from '@/components/sections/LocationSection';

// Modals
import TableBookingModal from '@/components/modals/TableBookingModal';

export default function HomePage() {
  const { settings } = useCafe();

  // Sort and filter active sections dynamically
  const sortedSections = [...settings.sections]
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order);

  const renderSection = (sectionId: string) => {
    if (sectionId === 'hero') return <HeroSection key="hero" />;

    let content: React.ReactNode = null;
    switch (sectionId) {
      case 'story': content = <RoasteryStorySection />; break;
      case 'cupping': content = <CuppingWheelSection />; break;
      case 'menu': content = <MenuSection />; break;
      case 'ambience': content = <LiveAtmosphereSection />; break;
      case 'booking': content = <TableBookingSection />; break;
      case 'reviews': content = <ReviewsSection />; break;
      case 'location': content = <LocationSection />; break;
      default: return null;
    }

    return <CinematicReveal key={sectionId}>{content}</CinematicReveal>;
  };

  return (
    <div 
      className="relative min-h-screen selection:bg-amber-500 selection:text-black overflow-x-hidden"
      style={{
        backgroundColor: settings.theme.backgroundColor,
        color: settings.theme.textColor,
        fontFamily: settings.typography.bodyFont,
      }}
    >
      {/* 1. Persistent cinematic background engine and optical atmosphere */}
      <CinematicCoffeeCanvas />
      <CinematicAtmosphere />
      <SmoothScroll />

      {/* 2. Interactive Custom Cursor */}
      <CustomCursor />

      {/* 3. Luxury Loading Screen */}
      <CinematicLoader />

      {/* 4. Top Announcement / Mosque Prayer Ticker (if position === 'top') */}
      {settings.ticker.position === 'top' && <AnnouncementTicker />}

      {/* 5. Header Navigation */}
      <Header />

      {/* Floating or Bottom Ticker (if not top) */}
      {settings.ticker.position !== 'top' && <AnnouncementTicker />}

      {/* 6. Dynamic Ordered Content Sections */}
      <main className="relative z-10 flex flex-col">
        {sortedSections.map(section => renderSection(section.id))}
      </main>

      {/* 7. Footer */}
      <Footer />

      {/* 8. Interactive Drawers & Overlays */}
      <TableBookingModal />
      <SoundscapePlayer />
      <Toast />
    </div>
  );
}
