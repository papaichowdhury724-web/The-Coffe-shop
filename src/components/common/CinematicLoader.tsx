'use client';

import React, { useEffect, useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Sparkles, Flame, Coffee } from 'lucide-react';

export default function CinematicLoader() {
  const { settings, brandName, isHydrated } = useCafe();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Wait until the saved brand/theme has been read, otherwise the OLD default name flashes.
    if (!isHydrated) return;
    // Smooth progress simulation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 350);
          return 100;
        }
        const step = Math.floor(Math.random() * 14) + 6;
        return Math.min(100, prev + step);
      });
    }, 90);

    return () => clearInterval(interval);
  }, [isHydrated]);

  if (!loading) return null;

  // Before saved settings are loaded just show a plain cover (no brand text yet).
  if (!isHydrated) {
    return <div className="fixed inset-0 z-50" style={{ backgroundColor: settings.theme.backgroundColor }} />;
  }

  const initials = brandName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'AN';

  const style = settings.animation.loadingStyle;
  const primaryColor = settings.theme.primaryColor;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-700 ease-out"
      style={{
        backgroundColor: settings.theme.backgroundColor,
      }}
    >
      {/* Background soft ambient halo */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          backgroundColor: primaryColor,
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
        {style === 'espresso-fill' && (
          <div className="relative mb-6">
            <div className="w-20 h-24 border-2 rounded-b-2xl relative overflow-hidden flex items-end justify-center"
              style={{ borderColor: `${primaryColor}80` }}
            >
              <div 
                className="w-full transition-all duration-150 ease-out flex items-center justify-center relative"
                style={{
                  height: `${progress}%`,
                  background: 'linear-gradient(to top, #241108 0%, #63381B 70%, #D4AF37 100%)',
                }}
              >
                {progress > 20 && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-amber-300 animate-pulse shadow-sm" />
                )}
              </div>
            </div>
            {/* Cup handle */}
            <div 
              className="absolute top-4 -right-3 w-4 h-9 border-2 border-l-0 rounded-r-xl"
              style={{ borderColor: `${primaryColor}80` }}
            />
          </div>
        )}

        {style === 'monogram-glow' && (
          <div className="relative mb-6">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center border text-2xl font-serif font-bold tracking-widest shadow-2xl animate-pulse"
              style={{
                borderColor: primaryColor,
                color: primaryColor,
                boxShadow: `0 0 35px ${primaryColor}40`,
              }}
            >
              {initials}
            </div>
          </div>
        )}

        {style === 'roaster-ring' && (
          <div className="relative mb-6 w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke={primaryColor}
                strokeWidth="3"
                strokeDasharray="213"
                strokeDashoffset={213 - (213 * progress) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-150 ease-out"
              />
            </svg>
            <Flame className="w-6 h-6 absolute text-amber-400 animate-bounce" />
          </div>
        )}

        {style === 'vintage-dial' && (
          <div className="relative mb-6 flex flex-col items-center">
            <Coffee className="w-10 h-10 mb-2 text-amber-300 animate-pulse" />
            <span className="text-3xl font-mono tracking-tighter" style={{ color: primaryColor }}>
              {progress.toString().padStart(3, '0')}%
            </span>
          </div>
        )}

        {style === 'minimal-fade' && (
          <div className="mb-6 flex gap-1.5 items-center">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <div className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
        )}

        {/* Brand Name & Tagline */}
        <h2 
          className="text-2xl font-serif tracking-[0.3em] font-light mb-1"
          style={{ color: settings.theme.textColor }}
        >
          {brandName}
        </h2>
        <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400/80 mb-4">
          {settings.header.brandTagline || settings.tagline}
        </p>

        {/* Progress Bar & percentage */}
        <div className="w-48 h-1 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
          <div 
            className="h-full transition-all duration-150 ease-out rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: primaryColor,
              boxShadow: `0 0 10px ${primaryColor}`,
            }}
          />
        </div>

        <span className="mt-2 text-[10px] font-mono text-stone-500 tracking-wider">
          CALIBRATING EXTRACTION • {progress}%
        </span>
      </div>
    </div>
  );
}
