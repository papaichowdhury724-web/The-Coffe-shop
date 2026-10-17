'use client';

import React from 'react';
import { useCafe } from '@/context/CafeContext';
import { Flame, Compass, Award, Droplets, CheckCircle2 } from 'lucide-react';

export default function RoasteryStorySection() {
  const { settings, playClickSound } = useCafe();
  const story = settings.story;
  const primaryColor = settings.theme.primaryColor;

  return (
    <section id="story" className="relative py-28 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden">
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
            <Compass className="w-3.5 h-3.5" />
            <span>{story.badge}</span>
          </div>

          <h2 
            className="text-3xl sm:text-5xl font-serif font-light tracking-wide uppercase mb-4"
            style={{ color: settings.theme.textColor }}
          >
            {story.title}
          </h2>

          <p className="text-amber-200/90 text-sm sm:text-base font-light italic max-w-xl">
            {story.subtitle}
          </p>
        </div>

        {/* 2-Column Story Grid with Cinematic Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Story narrative & stats */}
          <div className="lg:col-span-7 space-y-6">
            <div 
              className="p-8 sm:p-10 rounded-3xl backdrop-blur-xl border relative overflow-hidden"
              style={{
                backgroundColor: `${settings.theme.cardBackground}c0`,
                borderColor: `${primaryColor}25`,
                boxShadow: `0 20px 40px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Background amber glow */}
              <div 
                className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-15 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 62%)` }}
              />

              <div className="space-y-5 text-stone-300 text-sm sm:text-base leading-relaxed relative z-10 font-light">
                {story.paragraphs.map((p, idx) => (
                  <p key={idx} className="tracking-wide">
                    {p}
                  </p>
                ))}
              </div>

              {/* Story Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-stone-800 relative z-10">
                {story.stats?.map((stat, i) => (
                  <div key={i} className="text-center sm:text-left">
                    <p className="text-2xl sm:text-3xl font-serif font-bold" style={{ color: primaryColor }}>
                      {stat.number}
                    </p>
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-400 mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Commitment Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Flame, title: 'Cast-Iron Drum Roasting', desc: 'Even thermal curve at 205°C' },
                { icon: Droplets, title: '93.5°C Pure Extraction', desc: 'Triple volcanic rock filtration' },
                { icon: Award, title: 'Specialty Q-Grade 90+', desc: 'Zero defect micro-lots' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    backgroundColor: `${settings.theme.cardBackground}90`,
                    borderColor: `${primaryColor}20`,
                  }}
                >
                  <item.icon className="w-5 h-5 mb-2 text-amber-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200 mb-1">{item.title}</h4>
                  <p className="text-[11px] text-stone-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Craft Glass Frame */}
          <div className="lg:col-span-5 relative">
            <div 
              className="relative rounded-3xl overflow-hidden border p-2 shadow-2xl group"
              style={{
                borderColor: `${primaryColor}35`,
                backgroundColor: `${settings.theme.cardBackground}80`,
              }}
            >
              <div className="relative h-[420px] rounded-2xl overflow-hidden">
                <img loading="lazy" decoding="async"
                  src="/images/brewing-art.jpg"
                  alt="Artisanal Pour-Over Extraction"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to stock image if needed
                    e.currentTarget.src = 'https://images.pexels.com/photos/8937268/pexels-photo-8937268.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200';
                  }}
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                <div className="absolute bottom-4 inset-x-4 p-4 rounded-xl backdrop-blur-md bg-black/60 border border-amber-900/40">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Chapter II • Manual V60 Chemistry
                  </span>
                  <p className="text-xs text-stone-300">
                    Precision bloom time of 45 seconds to release trapped carbon dioxide and enhance bright jasmine florals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
