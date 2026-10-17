'use client';

import React from 'react';
import { useCafe } from '@/context/CafeContext';
import { Sparkles, Calendar, ChevronDown, ArrowRight, ShieldCheck } from 'lucide-react';

export default function HeroSection() {
  const { settings, setIsBookingModalOpen, playClickSound } = useCafe();
  const hero = settings.hero;
  const primaryColor = settings.theme.primaryColor;

  return (
    <section 
      id="experience" 
      className="relative min-h-screen flex flex-col justify-between pt-32 pb-12 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden"
    >
      {/* Subtle Ambient Radial Lighting */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] max-w-[160vw] rounded-full pointer-events-none opacity-25"
        style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 62%)` }}
      />

      {/* Top Main Hero Copy */}
      <div className="max-w-4xl mx-auto text-center my-auto relative z-10 flex flex-col items-center">
        {/* Origin / Artisanal Badge */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.25em] uppercase mb-6 backdrop-blur-md border animate-fade-in"
          style={{
            backgroundColor: `${settings.theme.cardBackground}80`,
            borderColor: `${primaryColor}40`,
            color: primaryColor,
            boxShadow: `0 0 20px ${primaryColor}20`,
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>{hero.badge}</span>
        </div>

        {/* Big Cinematic Headline */}
        <h1 
          className="text-4xl sm:text-6xl md:text-7xl font-serif font-light tracking-[0.12em] uppercase leading-[1.08] mb-6 drop-shadow-2xl"
          style={{ 
            color: settings.theme.textColor,
            transform: `scale(${settings.typography.titleScale})`,
          }}
        >
          <span>{hero.titleLine1}</span>
          <span className="block italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
            {hero.titleLine2}
          </span>
        </h1>

        {/* Cinematic Description */}
        <p className="max-w-2xl text-stone-300 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-10 text-center tracking-wide">
          {hero.description}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
          <a
            href="#menu"
            onClick={playClickSound}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-2 group"
            style={{
              backgroundColor: primaryColor,
              color: '#0A0807',
              boxShadow: `0 0 30px ${primaryColor}50`,
            }}
          >
            <span>{hero.primaryCtaText || 'Explore Menu'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>

          {settings.booking.enabled ? (
            <button
              onClick={() => {
                playClickSound();
                setIsBookingModalOpen(true);
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md border flex items-center justify-center gap-2"
              style={{
                backgroundColor: `${settings.theme.cardBackground}80`,
                borderColor: `${primaryColor}40`,
                color: settings.theme.textColor,
              }}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{hero.secondaryCtaText || 'Reserve Lounge'}</span>
            </button>
          ) : (
            <a
              href="#story"
              onClick={playClickSound}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md border flex items-center justify-center gap-2"
              style={{
                backgroundColor: `${settings.theme.cardBackground}80`,
                borderColor: `${primaryColor}40`,
                color: settings.theme.textColor,
              }}
            >
              <span>Our Roastery Craft</span>
            </a>
          )}
        </div>
      </div>

      {/* Bottom Hero Stats & Scroll Prompt */}
      <div className="max-w-6xl mx-auto w-full pt-10 border-t border-stone-800/40 mt-8 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 sm:gap-12 text-center md:text-left">
          {hero.stats?.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-xl sm:text-2xl font-serif font-bold tracking-wider" style={{ color: primaryColor }}>
                {stat.value}
              </p>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-stone-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Scroll Interactive Indicator */}
        <div className="flex flex-col items-center gap-2 text-stone-400 animate-pulse">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-amber-300/80">
            Scroll to Begin Journey
          </span>
          <div 
            className="w-5 h-8 rounded-full border flex items-start justify-center p-1"
            style={{ borderColor: `${primaryColor}50` }}
          >
            <div className="w-1 h-2 rounded-full bg-amber-400 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
