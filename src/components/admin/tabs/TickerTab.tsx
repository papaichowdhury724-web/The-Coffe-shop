'use client';

import React from 'react';
import { useCafe } from '@/context/CafeContext';
import { TickerPosition } from '@/lib/types';
import { Bell, Moon, Tag, Sparkles, Lock, Unlock, Check } from 'lucide-react';

export default function TickerTab() {
  const { settings, updateSettings, showToast, playClickSound } = useCafe();
  const ticker = settings.ticker;
  const primaryColor = settings.theme.primaryColor;

  const updateTicker = (partial: Partial<typeof ticker>) => {
    playClickSound();
    updateSettings({
      ticker: {
        ...ticker,
        ...partial,
      },
    });
    showToast('Live Marquee / Mosque Updates Bar updated.');
  };

  // Silent update for text fields: no click sound / toast on every keystroke (that made typing laggy).
  const patchTicker = (partial: Partial<typeof ticker>) => {
    updateSettings({ ticker: { ...ticker, ...partial } });
  };

  const updatePrayerTime = (key: keyof NonNullable<typeof ticker.prayerTimes>, value: string) => {
    updateSettings({
      ticker: {
        ...ticker,
        prayerTimes: {
          ...ticker.prayerTimes,
          [key]: value,
        } as typeof ticker.prayerTimes,
      },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Live Marquee & Mosque Updates Studio
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Display live Mosque prayer timings, flash promo codes, and roastery alerts. Choose whether it shows at the top or bottom of the screen, and lock/unlock dismissibility.
          </p>
        </div>

        <button
          onClick={() => updateTicker({ enabled: !ticker.enabled })}
          className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
            ticker.enabled
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60'
              : 'bg-red-500/20 text-red-300 border border-red-500/60'
          }`}
        >
          {ticker.enabled ? 'Ticker: ACTIVE (ON)' : 'Ticker: DISABLED (OFF)'}
        </button>
      </div>

      {/* Position & Lock Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Position */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
          <label className="text-xs uppercase font-semibold text-stone-300 block">
            Screen Position
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'top', label: 'Top Bar' },
              { id: 'bottom', label: 'Sticky Bottom' },
              { id: 'floating', label: 'Floating Pill' },
            ].map((pos) => (
              <button
                key={pos.id}
                type="button"
                onClick={() => updateTicker({ position: pos.id as TickerPosition })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                  ticker.position === pos.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-black/40 border-stone-800 text-stone-400'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lock / Unlock Mode */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
          <label className="text-xs uppercase font-semibold text-stone-300 block">
            Dismissibility & Lock Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateTicker({ isLocked: true })}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                ticker.isLocked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                  : 'bg-black/40 border-stone-800 text-stone-400'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Locked (Permanent)</span>
            </button>

            <button
              type="button"
              onClick={() => updateTicker({ isLocked: false })}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                !ticker.isLocked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                  : 'bg-black/40 border-stone-800 text-stone-400'
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Dismissible (Has X)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ticker Content Type */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
        <label className="text-xs uppercase font-semibold text-stone-300 block">
          Announcement Mode / Content Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'mosque_prayer', label: 'Mosque Prayer Times', icon: Moon },
            { id: 'offer', label: 'Flash Privilege Offer', icon: Tag },
            { id: 'roast_alert', label: 'Roastery Alert', icon: Sparkles },
            { id: 'custom', label: 'Custom Message', icon: Bell },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => updateTicker({ type: type.id as typeof ticker.type })}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                ticker.type === type.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-black/40 border-stone-800 text-stone-400'
              }`}
            >
              <type.icon className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold">{type.label}</span>
            </button>
          ))}
        </div>

        {/* If Mosque Prayer Times: Show timings inputs */}
        {ticker.type === 'mosque_prayer' && (
          <div className="p-5 rounded-2xl bg-black/50 border border-emerald-900/50 space-y-3 pt-4">
            <h5 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5" />
              <span>Configure Mosque Daily Prayer Timings:</span>
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { key: 'fajr', label: 'Fajr' },
                { key: 'dhuhr', label: 'Dhuhr' },
                { key: 'asr', label: 'Asr' },
                { key: 'maghrib', label: 'Maghrib' },
                { key: 'isha', label: 'Isha' },
              ].map((p) => (
                <div key={p.key}>
                  <label className="text-[10px] font-mono text-stone-400 uppercase block mb-1">
                    {p.label}
                  </label>
                  <input
                    type="text"
                    value={ticker.prayerTimes?.[p.key as keyof typeof ticker.prayerTimes] || ''}
                    onChange={(e) => updatePrayerTime(p.key as keyof NonNullable<typeof ticker.prayerTimes>, e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs font-mono text-amber-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standard Message and Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Badge Label Text
            </label>
            <input
              type="text"
              value={ticker.badgeText}
              onChange={(e) => patchTicker({ badgeText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              CTA Link Text (Optional)
            </label>
            <input
              type="text"
              value={ticker.linkText || ''}
              onChange={(e) => patchTicker({ linkText: e.target.value })}
              placeholder="e.g. Explore Tasting Flight"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Announcement Message
            </label>
            <textarea
              rows={2}
              value={ticker.message}
              onChange={(e) => patchTicker({ message: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
