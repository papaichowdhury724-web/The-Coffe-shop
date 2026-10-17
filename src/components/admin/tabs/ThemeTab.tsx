'use client';

import React from 'react';
import { useCafe } from '@/context/CafeContext';
import { ThemePreset } from '@/lib/types';
import { Palette, Type, Sliders, Sparkles, Check } from 'lucide-react';

const themePresets: {
  id: ThemePreset;
  name: string;
  primary: string;
  accent: string;
  bg: string;
  card: string;
}[] = [
  {
    id: 'velvet-obsidian',
    name: 'Velvet Obsidian & Gold',
    primary: '#D4AF37',
    accent: '#E0A96D',
    bg: '#0A0807',
    card: '#140E0B',
  },
  {
    id: 'roasted-espresso',
    name: 'Roasted Espresso & Cognac',
    primary: '#E0A96D',
    accent: '#C68B59',
    bg: '#0F0A07',
    card: '#1C120D',
  },
  {
    id: 'warm-caramel',
    name: 'Warm Amber Latte & Cream',
    primary: '#F59E0B',
    accent: '#D97706',
    bg: '#120C08',
    card: '#1E140E',
  },
  {
    id: 'matcha-emerald',
    name: 'Matcha Emerald & Brass',
    primary: '#10B981',
    accent: '#34D399',
    bg: '#06120E',
    card: '#0D201A',
  },
  {
    id: 'cyber-roast',
    name: 'Cyber Midnight Roast',
    primary: '#F43F5E',
    accent: '#FB7185',
    bg: '#0A0A0F',
    card: '#141420',
  },
  {
    id: 'nordic-ivory',
    name: 'Nordic Clean Minimal',
    primary: '#E2E8F0',
    accent: '#94A3B8',
    bg: '#0F172A',
    card: '#1E293B',
  },
];

export default function ThemeTab() {
  const { settings, updateSettings, showToast, playClickSound } = useCafe();
  const theme = settings.theme;
  const typography = settings.typography;
  const primaryColor = theme.primaryColor;

  const handleSelectPreset = (p: typeof themePresets[0]) => {
    playClickSound();
    updateSettings({
      theme: {
        ...theme,
        preset: p.id,
        primaryColor: p.primary,
        accentColor: p.accent,
        backgroundColor: p.bg,
        cardBackground: p.card,
      },
    });
    showToast(`Applied preset: ${p.name}`);
  };

  const updateTheme = (partial: Partial<typeof theme>) => {
    updateSettings({ theme: { ...theme, ...partial } });
  };

  const updateTypography = (partial: Partial<typeof typography>) => {
    updateSettings({ typography: { ...typography, ...partial } });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800">
        <h3 className="text-base font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400" />
          Aesthetic Theme & Typography Engine
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Customize color schemes, luxury typography scalers, and cart drawer font sizes with real-time website synchronization.
        </p>
      </div>

      {/* 1. Theme Presets */}
      <div className="space-y-4">
        <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
          1. Luxury Color Presets
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themePresets.map((p) => {
            const isSelected = theme.preset === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected ? 'border-amber-400 shadow-xl bg-amber-500/10 scale-[1.02]' : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-bold text-white">{p.name}</h5>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg border border-white/20" style={{ backgroundColor: p.primary }} title="Primary" />
                  <span className="w-6 h-6 rounded-lg border border-white/20" style={{ backgroundColor: p.accent }} title="Accent" />
                  <span className="w-6 h-6 rounded-lg border border-white/20" style={{ backgroundColor: p.bg }} title="Background" />
                  <span className="w-6 h-6 rounded-lg border border-white/20" style={{ backgroundColor: p.card }} title="Card Background" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Custom Hex Colors */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
        <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
          2. Custom Hex Color Palette
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1.5">
              Primary Antique Gold
            </label>
            <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-stone-800">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-white">{theme.primaryColor}</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1.5">
              Secondary Amber Accent
            </label>
            <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-stone-800">
              <input
                type="color"
                value={theme.accentColor}
                onChange={(e) => updateTheme({ accentColor: e.target.value })}
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-white">{theme.accentColor}</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1.5">
              Sanctuary Dark Background
            </label>
            <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-stone-800">
              <input
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-white">{theme.backgroundColor}</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1.5">
              Card Background
            </label>
            <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-stone-800">
              <input
                type="color"
                value={theme.cardBackground}
                onChange={(e) => updateTheme({ cardBackground: e.target.value })}
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-white">{theme.cardBackground}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Typography Scalers & Cart Font Size */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-6">
        <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Type className="w-4 h-4 text-amber-400" />
          <span>3. Typography & Cart Font Size Scalers</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Heading Font Family */}
          <div>
            <label className="text-xs uppercase font-semibold text-stone-300 block mb-2">
              Heading Font Family
            </label>
            <select
              value={typography.headingFont}
              onChange={(e) => updateTypography({ headingFont: e.target.value as typeof typography.headingFont })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Cinzel">Cinzel (Luxury Roman Romanesque)</option>
              <option value="Playfair Display">Playfair Display (High-End Serif)</option>
              <option value="Cormorant Garamond">Cormorant Garamond (Artisanal Delicate)</option>
              <option value="Montserrat">Montserrat (Clean Geometric)</option>
              <option value="Outfit">Outfit (Modern Tech)</option>
              <option value="Syne">Syne (Architectural Avant-Garde)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary)</option>
            </select>
          </div>

          {/* Body Font Family */}
          <div>
            <label className="text-xs uppercase font-semibold text-stone-300 block mb-2">
              Body Typography
            </label>
            <select
              value={typography.bodyFont}
              onChange={(e) => updateTypography({ bodyFont: e.target.value as typeof typography.bodyFont })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Outfit">Outfit</option>
              <option value="Inter">Inter</option>
              <option value="Lora">Lora (Editorial Serif)</option>
            </select>
          </div>
        </div>

        {/* Font Scalers Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-stone-800">
          {/* Title Scale */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-stone-300">
              <span>Headline Title Scale</span>
              <span className="font-mono text-amber-400">{typography.titleScale}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={typography.titleScale}
              onChange={(e) => updateTypography({ titleScale: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Body Scale */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-stone-300">
              <span>Body Text Scale</span>
              <span className="font-mono text-amber-400">{typography.bodyScale}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={typography.bodyScale}
              onChange={(e) => updateTypography({ bodyScale: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Cart Drawer Font Size */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-stone-300">
              <span className="font-bold text-amber-300">Cart Font Size</span>
              <span className="font-mono text-amber-400">{typography.cartFontSize || 15}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="20"
              step="1"
              value={typography.cartFontSize || 15}
              onChange={(e) => updateTypography({ cartFontSize: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
