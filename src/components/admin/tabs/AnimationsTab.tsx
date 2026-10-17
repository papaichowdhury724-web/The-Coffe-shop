'use client';

import React from 'react';
import { useCafe } from '@/context/CafeContext';
import { 
  LoadingAnimationStyle, 
  ScrollAnimationStyle, 
  HoverEffectStyle, 
  CursorStyle 
} from '@/lib/types';
import { 
  Film, 
  Sparkles, 
  MousePointer, 
  Flame, 
  Coffee, 
  Volume2, 
  Check, 
  Sliders, 
  Eye 
} from 'lucide-react';

export default function AnimationsTab() {
  const { settings, updateSettings, showToast, playClickSound } = useCafe();
  const primaryColor = settings.theme.primaryColor;
  const anim = settings.animation;

  const updateAnim = (partial: Partial<typeof anim>) => {
    playClickSound();
    updateSettings({
      animation: {
        ...anim,
        ...partial,
      },
    });
    showToast('Cinematic animation settings updated.');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Intro Header */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800">
        <h3 className="text-base font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-400" />
          Cinematic Animation & Choreography Studio
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Select cinematic behaviors for initial loading, 3D scroll transitions, hover micro-interactions, and custom cursor physics. Each option includes a live interactive preview below.
        </p>
      </div>

      {/* 1. Loading Animation Styles with Live Previews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>1. Loading Screen Animation Style</span>
            <span className="text-xs font-mono text-amber-400 font-normal">({anim.loadingStyle})</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              id: 'espresso-fill',
              name: 'Espresso Liquid Fill',
              desc: 'Liquid espresso fills cup with crema',
              renderPreview: () => (
                <div className="w-12 h-16 border-2 border-amber-400/80 rounded-b-xl relative overflow-hidden flex items-end">
                  <div className="w-full h-3/4 bg-gradient-to-t from-amber-950 to-amber-600 animate-pulse" />
                </div>
              ),
            },
            {
              id: 'monogram-glow',
              name: 'Golden Monogram Glow',
              desc: 'Pulsing luxury gold monogram',
              renderPreview: () => (
                <div className="w-12 h-12 rounded-full border border-amber-400 flex items-center justify-center font-serif font-bold text-amber-300 shadow-[0_0_15px_#D4AF37] animate-pulse">
                  AN
                </div>
              ),
            },
            {
              id: 'roaster-ring',
              name: 'Roaster Dial Gauge',
              desc: 'Thermal curve dial with flame',
              renderPreview: () => (
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>
              ),
            },
            {
              id: 'vintage-dial',
              name: 'Vintage Dial Counter',
              desc: 'Digital extraction percentage',
              renderPreview: () => (
                <div className="flex flex-col items-center">
                  <Coffee className="w-6 h-6 text-amber-300 animate-bounce" />
                  <span className="text-xs font-mono font-bold text-amber-400 mt-1">098%</span>
                </div>
              ),
            },
            {
              id: 'minimal-fade',
              name: 'Minimalist Pulse',
              desc: 'Sleek luxury golden dots',
              renderPreview: () => (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                </div>
              ),
            },
          ].map((item) => {
            const isSelected = anim.loadingStyle === item.id;
            return (
              <div
                key={item.id}
                onClick={() => updateAnim({ loadingStyle: item.id as LoadingAnimationStyle })}
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 shadow-xl scale-[1.02]'
                    : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                }`}
              >
                {/* Live Preview Box */}
                <div className="h-24 rounded-xl bg-black/60 border border-stone-800/80 flex items-center justify-center mb-3">
                  {item.renderPreview()}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-xs font-bold text-white">{item.name}</h5>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[10px] text-stone-400">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Scroll Animation Engine with Live Previews */}
      <div className="space-y-4">
        <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>2. 3D Scroll Choreography Engine</span>
          <span className="text-xs font-mono text-amber-400 font-normal">({anim.scrollStyle})</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: '3d-camera-orbit',
              name: '3D Camera Orbit & Beans',
              desc: 'WebGL 3D cup rotates and shifts with orbiting roasted beans',
              badge: 'Recommended',
            },
            {
              id: 'cinematic-parallax',
              name: 'Cinematic Parallax Zoom',
              desc: 'Layered macro zoom with volumetric light streaks',
              badge: 'Cinematic',
            },
            {
              id: 'velvet-fade-slide',
              name: 'Velvet Fade & Slide',
              desc: 'Silky smooth upward transforms with golden halo',
              badge: 'Smooth',
            },
            {
              id: 'split-story',
              name: 'Split Curtain Reveal',
              desc: 'Dynamic chapter doors splitting as user navigates',
              badge: 'Creative',
            },
          ].map((item) => {
            const isSelected = anim.scrollStyle === item.id;
            return (
              <div
                key={item.id}
                onClick={() => updateAnim({ scrollStyle: item.id as ScrollAnimationStyle })}
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 shadow-xl scale-[1.02]'
                    : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-black/60 text-amber-300 border border-stone-800">
                    {item.badge}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white mb-1">{item.name}</h5>
                  <p className="text-[11px] text-stone-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Hover Effects & Custom Cursor with Interactive Testing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hover Styles */}
        <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
          <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
            3. Card & Button Hover Effects
          </h4>
          <div className="space-y-2.5">
            {[
              { id: 'magnetic-glow', name: 'Magnetic Golden Glow', desc: 'Aura glow follows pointer' },
              { id: 'velvet-lift', name: 'Velvet 3D Elevation', desc: 'Subtle lift with deep shadow' },
              { id: 'liquid-ripple', name: 'Liquid Coffee Ripple', desc: 'Radial wave pulse on mouseover' },
              { id: 'golden-border', name: 'Golden Edge Shimmer', desc: 'Luminous border light gradient' },
            ].map((item) => {
              const isSelected = anim.hoverStyle === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => updateAnim({ hoverStyle: item.id as HoverEffectStyle })}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    isSelected ? 'bg-amber-500/20 border-amber-400' : 'bg-black/40 border-stone-800'
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.name}</h5>
                    <p className="text-[10px] text-stone-400">{item.desc}</p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Cursor Styles */}
        <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
          <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-amber-400" />
            <span>4. Custom Cursor Experience</span>
          </h4>
          <div className="space-y-2.5">
            {[
              { id: 'coffee-bean', name: '3D Roasted Coffee Bean', desc: 'Micro coffee bean with crease & golden halo' },
              { id: 'golden-ring', name: 'Golden Trailing Ring', desc: 'Smooth expanding luxury halo' },
              { id: 'velvet-dot', name: 'Velvet Ivory Dot', desc: 'Minimalist refined pointer' },
              { id: 'default', name: 'Standard System Pointer', desc: 'Browser native cursor' },
            ].map((item) => {
              const isSelected = anim.cursorStyle === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => updateAnim({ cursorStyle: item.id as CursorStyle })}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    isSelected ? 'bg-amber-500/20 border-amber-400' : 'bg-black/40 border-stone-800'
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.name}</h5>
                    <p className="text-[10px] text-stone-400">{item.desc}</p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Sound & Atmospheric Feedback Switches */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
        <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>5. Soundscape & Haptic Audio Feedback</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-stone-800 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-white">Procedural Ambient Cafe Soundscape</h5>
              <p className="text-[11px] text-stone-400">Vinyl jazz chords & soft rain acoustics</p>
            </div>
            <button
              onClick={() => updateAnim({ enableSoundscape: !anim.enableSoundscape })}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                anim.enableSoundscape ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-stone-800 text-stone-400'
              }`}
            >
              {anim.enableSoundscape ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-stone-800 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-white">Crisp UI Click Synthesizer</h5>
              <p className="text-[11px] text-stone-400">Subtle haptic click on interactive buttons</p>
            </div>
            <button
              onClick={() => updateAnim({ enableClickSounds: !anim.enableClickSounds })}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                anim.enableClickSounds ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-stone-800 text-stone-400'
              }`}
            >
              {anim.enableClickSounds ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
