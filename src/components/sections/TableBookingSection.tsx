'use client';

import React from 'react';
import { useCafe } from '@/context/CafeContext';
import { Calendar, Users, Sparkles, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function TableBookingSection() {
  const { 
    settings, 
    setIsBookingModalOpen, 
    setSelectedBookingArea, 
    playClickSound 
  } = useCafe();

  // If table booking is disabled globally from admin panel, hide this section
  if (!settings.booking.enabled) {
    return null;
  }

  const { title, subtitle, seatingAreas } = settings.booking;
  const primaryColor = settings.theme.primaryColor;

  const handleBookArea = (areaName: string) => {
    playClickSound();
    setSelectedBookingArea(areaName);
    setIsBookingModalOpen(true);
  };

  return (
    <section id="booking" className="relative py-28 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div 
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-[0.25em] uppercase mb-4 backdrop-blur-md border"
            style={{
              backgroundColor: `${settings.theme.cardBackground}90`,
              borderColor: `${primaryColor}40`,
              color: primaryColor,
            }}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Table & Lounge Sanctuary</span>
          </div>

          <h2 
            className="text-3xl sm:text-5xl font-serif font-light tracking-wide uppercase mb-4"
            style={{ color: settings.theme.textColor }}
          >
            {title || 'Reserve Your Table'}
          </h2>

          <p className="text-stone-300 text-sm sm:text-base font-light max-w-xl mx-auto">
            {subtitle || 'Step into an intimate sanctuary of dark velvet, amber lighting, and master barista pairings.'}
          </p>
        </div>

        {/* Seating Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {seatingAreas.map((area) => (
            <div
              key={area.id}
              className="group rounded-3xl border backdrop-blur-md overflow-hidden flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative"
              style={{
                backgroundColor: `${settings.theme.cardBackground}c0`,
                borderColor: `${primaryColor}25`,
              }}
            >
              {/* Image Preview */}
              <div className="relative h-48 overflow-hidden">
                <img loading="lazy" decoding="async"
                  src={area.image}
                  alt={area.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase bg-black/70 text-amber-300 border border-amber-900/40">
                  {area.capacity}
                </span>
              </div>

              {/* Info & CTA */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                    {area.name}
                  </h3>
                  <p className="text-xs text-stone-300 font-light mt-1.5 leading-relaxed line-clamp-3">
                    {area.description}
                  </p>
                </div>

                <button
                  onClick={() => handleBookArea(area.name)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-black transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>Select & Reserve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* VIP Roastery Privilege Banner */}
        <div 
          className="p-8 rounded-3xl border backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #18110D 0%, #0F0906 100%)',
            borderColor: `${primaryColor}30`,
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0"
              style={{
                borderColor: primaryColor,
                backgroundColor: `${settings.theme.cardBackground}80`,
              }}
            >
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-serif font-bold text-white">
                Private Cupping Flights & Roastery Masterclasses
              </h4>
              <p className="text-xs text-stone-400 mt-0.5 max-w-xl">
                Looking for exclusive 8+ guest coffee omakase sessions or private barista workshops? Our roastery team crafts bespoke experiences.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setSelectedBookingArea('Private Tasting Chamber');
              setIsBookingModalOpen(true);
            }}
            className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-stone-200 border border-amber-500/40 hover:border-amber-400 hover:text-white bg-stone-900/80 transition-all whitespace-nowrap"
          >
            Inquire VIP Chamber
          </button>
        </div>
      </div>
    </section>
  );
}
