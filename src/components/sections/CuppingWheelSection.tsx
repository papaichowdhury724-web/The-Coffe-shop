'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Sparkles, Compass, Check, ArrowRight } from 'lucide-react';

interface FlavorProfile {
  id: string;
  category: string;
  color: string;
  notes: string[];
  recommendedCoffee: string;
  origin: string;
  description: string;
}

const flavorProfiles: FlavorProfile[] = [
  {
    id: 'floral',
    category: 'Floral & Citrus',
    color: '#E6A15C',
    notes: ['Jasmine Blossom', 'Bergamot Orange', 'Meyer Lemon', 'Orange Blossom'],
    recommendedCoffee: 'V60 Origami Pour-Over Flight',
    origin: 'Kenya Nyeri Peaberry & Panama Geisha',
    description: 'Crisp, sparkling acidity reminiscent of black tea with fresh blossoms and candied citrus zest.',
  },
  {
    id: 'cacao',
    category: 'Dark Cacao & Truffle',
    color: '#8C5229',
    notes: ['70% Valrhona Dark Cacao', 'Black Cherry', 'Roasted Nibs', 'Molasses'],
    recommendedCoffee: 'Obsidian Velvet Espresso',
    origin: 'Panama Boquete Washed',
    description: 'Deep, rich viscosity with lingering dark chocolate decadence and subtle winey acidity.',
  },
  {
    id: 'caramel',
    category: 'Caramel & Dulce',
    color: '#D4AF37',
    notes: ['Salted Butterscotch', 'Toasted Vanilla Bean', 'Brown Sugar', 'Creme Brulee'],
    recommendedCoffee: 'Smoked Amber Spanish Latte',
    origin: 'Ethiopia Yirgacheffe Natural',
    description: 'Velvety sweetness and creamy mouthfeel that envelops the palate in warm comforting notes.',
  },
  {
    id: 'fruity',
    category: 'Stone Fruit & Berries',
    color: '#D97706',
    notes: ['White Peach', 'Ripe Blackcurrant', 'Passion Fruit', 'Wild Honey'],
    recommendedCoffee: 'Kyoto 18-Hour Slow Cold Drip',
    origin: 'Colombia Pink Bourbon',
    description: 'Exotic tropical sweetness layered with juicy berry notes and a clean, refreshing wine-like finish.',
  },
];

export default function CuppingWheelSection() {
  const { settings, playClickSound } = useCafe();
  const [activeProfile, setActiveProfile] = useState<FlavorProfile>(flavorProfiles[0]);
  const primaryColor = settings.theme.primaryColor;

  return (
    <section id="cupping" className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div 
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-[0.25em] uppercase mb-4 backdrop-blur-md border"
            style={{
              backgroundColor: `${settings.theme.cardBackground}90`,
              borderColor: `${primaryColor}40`,
              color: primaryColor,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Sensory Profile</span>
          </div>

          <h2 
            className="text-3xl sm:text-5xl font-serif font-light tracking-wide uppercase mb-4"
            style={{ color: settings.theme.textColor }}
          >
            The Cupping Wheel
          </h2>

          <p className="text-stone-300 text-sm sm:text-base font-light max-w-xl mx-auto">
            Explore the complex aromatic spectrum of our single-origin lots. Select a flavor profile to discover your ideal cup.
          </p>
        </div>

        {/* Profile Tabs & Interactive Display Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Interactive Category Selectors */}
          <div className="lg:col-span-5 space-y-3">
            {flavorProfiles.map((profile) => {
              const isSelected = activeProfile.id === profile.id;
              return (
                <div
                  key={profile.id}
                  onClick={() => {
                    playClickSound();
                    setActiveProfile(profile);
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between group ${
                    isSelected
                      ? 'scale-[1.02] shadow-xl'
                      : 'hover:scale-[1.01] opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${settings.theme.cardBackground}fa` : `${settings.theme.cardBackground}80`,
                    borderColor: isSelected ? profile.color : `${primaryColor}20`,
                    boxShadow: isSelected ? `0 0 25px ${profile.color}30` : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full transition-transform duration-300 group-hover:scale-125"
                      style={{ backgroundColor: profile.color }}
                    />
                    <div>
                      <h4 className="text-sm font-semibold tracking-wider uppercase text-stone-100">
                        {profile.category}
                      </h4>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {profile.notes.slice(0, 2).join(' • ')}
                      </p>
                    </div>
                  </div>

                  <ArrowRight 
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isSelected ? 'translate-x-0 text-amber-300' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 text-stone-400'
                    }`} 
                  />
                </div>
              );
            })}
          </div>

          {/* Right: Active Profile Showcase Showcase */}
          <div className="lg:col-span-7">
            <div 
              className="p-8 sm:p-10 rounded-3xl border backdrop-blur-xl relative overflow-hidden transition-all duration-500"
              style={{
                backgroundColor: `${settings.theme.cardBackground}f0`,
                borderColor: `${activeProfile.color}50`,
                boxShadow: `0 20px 50px rgba(0,0,0,0.6)`,
              }}
            >
              {/* Dynamic Aura Glow */}
              <div 
                className="absolute top-0 right-0 w-[32rem] h-[32rem] rounded-full opacity-20 pointer-events-none transition-opacity duration-700"
                style={{ background: `radial-gradient(circle, ${activeProfile.color} 0%, transparent 62%)` }}
              />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                  <span className="text-xs uppercase font-mono tracking-widest text-amber-300">
                    Sensory Breakdown
                  </span>
                  <span 
                    className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: `${activeProfile.color}20`,
                      color: activeProfile.color,
                      border: `1px solid ${activeProfile.color}40`,
                    }}
                  >
                    {activeProfile.category}
                  </span>
                </div>

                <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                  {activeProfile.description}
                </p>

                {/* Notes Pills */}
                <div>
                  <h5 className="text-xs uppercase tracking-widest text-stone-400 mb-3">
                    Aroma & Tasting Accents:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {activeProfile.notes.map((note, i) => (
                      <span
                        key={i}
                        className="px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${settings.theme.backgroundColor}90`,
                          borderColor: `${activeProfile.color}40`,
                          color: '#F5E6D3',
                        }}
                      >
                        <Check className="w-3 h-3 text-amber-400" />
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Extraction Pairing */}
                <div 
                  className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6"
                  style={{
                    backgroundColor: `${settings.theme.backgroundColor}cc`,
                    borderColor: `${activeProfile.color}30`,
                  }}
                >
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono">
                      Master Barista Recommendation:
                    </span>
                    <h4 className="text-sm font-serif font-bold text-amber-200 mt-0.5">
                      {activeProfile.recommendedCoffee}
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Origin: {activeProfile.origin}
                    </p>
                  </div>

                  <a
                    href="#menu"
                    onClick={playClickSound}
                    className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-black transition-transform duration-300 hover:scale-105 active:scale-95 shrink-0 text-center shadow-lg"
                    style={{ backgroundColor: activeProfile.color }}
                  >
                    View in Menu
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
