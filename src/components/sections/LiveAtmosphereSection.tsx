'use client';

import React from 'react';
import { useCafe } from '@/context/CafeContext';
import { Music, Disc, Volume2, Sparkles, Coffee, Heart } from 'lucide-react';

export default function LiveAtmosphereSection() {
  const { 
    settings, 
    brandName,
    isPlayingSoundscape, 
    toggleSoundscape, 
    soundscapeVibe, 
    setSoundscapeVibe, 
    playClickSound 
  } = useCafe();

  const primaryColor = settings.theme.primaryColor;

  return (
    <section id="ambience" className="relative py-28 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Atmospheric Soundscape Box */}
          <div className="lg:col-span-6 space-y-6">
            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-[0.25em] uppercase backdrop-blur-md border"
              style={{
                backgroundColor: `${settings.theme.cardBackground}90`,
                borderColor: `${primaryColor}40`,
                color: primaryColor,
              }}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Sensory Atmosphere</span>
            </div>

            <h2 
              className="text-3xl sm:text-5xl font-serif font-light tracking-wide uppercase leading-tight"
              style={{ color: settings.theme.textColor }}
            >
              Where Acoustics Meet Roasted Aromas
            </h2>

            <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed">
              Every hour at {brandName} is thoughtfully curated with analog vinyl acoustics, soft rain reverberation, and the gentle rhythm of manual pour-overs.
            </p>

            {/* Interactive Audio Player Deck */}
            <div 
              className="p-6 rounded-3xl border backdrop-blur-xl space-y-5"
              style={{
                backgroundColor: `${settings.theme.cardBackground}e0`,
                borderColor: `${primaryColor}30`,
              }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                      isPlayingSoundscape ? 'animate-spin' : ''
                    }`}
                    style={{
                      borderColor: primaryColor,
                      backgroundColor: `${settings.theme.backgroundColor}90`,
                      animationDuration: '8s',
                    }}
                  >
                    <Disc className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Live Atelier Soundscape
                    </h4>
                    <span className="text-[10px] font-mono uppercase text-amber-400">
                      {isPlayingSoundscape ? `Broadcasting: ${soundscapeVibe.toUpperCase()}` : 'Paused • Click to Listen'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    playClickSound();
                    toggleSoundscape();
                  }}
                  className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-black transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-1.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingSoundscape ? 'Pause' : 'Listen Live'}</span>
                </button>
              </div>

              {/* Vibe Switcher */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'jazz', name: 'Velvet Noir Jazz', tag: 'Sax & Bass warmth' },
                  { id: 'rain', name: 'Kyoto Rain Cafe', tag: 'Rain on cedar glass' },
                  { id: 'roastery', name: 'Midnight Roastery', tag: 'Cast-iron crackle' },
                ].map((vibe) => (
                  <button
                    key={vibe.id}
                    onClick={() => {
                      playClickSound();
                      setSoundscapeVibe(vibe.id as 'jazz' | 'rain' | 'roastery');
                      if (!isPlayingSoundscape) toggleSoundscape();
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      soundscapeVibe === vibe.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-xs font-bold block text-white">{vibe.name}</span>
                    <span className="text-[10px] opacity-75">{vibe.tag}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Velvet Lounge Image Gallery */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden border border-amber-900/40 shadow-xl h-56">
                  <img loading="lazy" decoding="async"
                    src="/images/velvet-lounge.jpg"
                    alt="Velvet Lounge Interior"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/7500681/pexels-photo-7500681.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200';
                    }}
                  />
                </div>
                <div className="rounded-3xl overflow-hidden border border-amber-900/40 shadow-xl h-40">
                  <img loading="lazy" decoding="async"
                    src="https://images.pexels.com/photos/14994661/pexels-photo-14994661.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                    alt="Cafe Interior"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <div className="rounded-3xl overflow-hidden border border-amber-900/40 shadow-xl h-40">
                  <img loading="lazy" decoding="async"
                    src="https://images.pexels.com/photos/35761362/pexels-photo-35761362.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                    alt="Warm Cafe Corner"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden border border-amber-900/40 shadow-xl h-56">
                  <img loading="lazy" decoding="async"
                    src="https://images.pexels.com/photos/36484101/pexels-photo-36484101.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                    alt="Modern Velvet Booths"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
