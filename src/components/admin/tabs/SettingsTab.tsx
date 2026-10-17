'use client';

import React from 'react';
import { useCafe } from '@/context/CafeContext';
import { Sliders, Sparkles, Check, DollarSign } from 'lucide-react';

export default function SettingsTab() {
  const { settings, updateSettings, showToast, playClickSound } = useCafe();
  const primaryColor = settings.theme.primaryColor;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. General Cafe Information & Currency */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-6">
        <h3 className="text-base font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-400" />
          General Atelier & Financial Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Atelier Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => updateSettings({ siteName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Currency Symbol
            </label>
            <input
              type="text"
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              placeholder="$ or ৳ or €"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Tax Percentage (%)
            </label>
            <input
              type="number"
              value={settings.taxPercent}
              onChange={(e) => updateSettings({ taxPercent: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Free Gift Basket Min ({settings.currency})
            </label>
            <input
              type="number"
              value={settings.freeComplimentaryGiftMin}
              onChange={(e) => updateSettings({ freeComplimentaryGiftMin: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Hero Headline Customizer */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-6">
        <h3 className="text-base font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Hero Cinematic Chapter Content
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Hero Floating Badge
            </label>
            <input
              type="text"
              value={settings.hero.badge}
              onChange={(e) => updateSettings({ hero: { ...settings.hero, badge: e.target.value } })}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Primary CTA Button Text
            </label>
            <input
              type="text"
              value={settings.hero.primaryCtaText}
              onChange={(e) => updateSettings({ hero: { ...settings.hero, primaryCtaText: e.target.value } })}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Headline Line 1
            </label>
            <input
              type="text"
              value={settings.hero.titleLine1}
              onChange={(e) => updateSettings({ hero: { ...settings.hero, titleLine1: e.target.value } })}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Headline Line 2 (Golden Italic)
            </label>
            <input
              type="text"
              value={settings.hero.titleLine2}
              onChange={(e) => updateSettings({ hero: { ...settings.hero, titleLine2: e.target.value } })}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Hero Sensory Description
            </label>
            <textarea
              rows={2}
              value={settings.hero.description}
              onChange={(e) => updateSettings({ hero: { ...settings.hero, description: e.target.value } })}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
