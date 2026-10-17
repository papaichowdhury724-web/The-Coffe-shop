'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Bell, Sparkles, Moon, Clock, X, ArrowRight, Tag } from 'lucide-react';

export default function AnnouncementTicker() {
  const { settings, showToast, playClickSound } = useCafe();
  const [isDismissed, setIsDismissed] = useState(false);

  const ticker = settings.ticker;
  const rootRef = useRef<HTMLDivElement>(null);
  const isTopBar = ticker.position === 'top' && ticker.enabled && !isDismissed;

  // The header is position:fixed, so a top ticker used to sit hidden *behind* it.
  // Publish the ticker height as a CSS variable so the header can sit just below it.
  useEffect(() => {
    const root = document.documentElement;
    const el = rootRef.current;
    const publish = (h: number) => {
      root.style.setProperty('--ticker-h', `${h}px`);
      window.dispatchEvent(new Event('ticker-resize'));
    };
    if (!isTopBar || !el) {
      publish(0);
      return;
    }
    const measure = () => publish(Math.round(el.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Web fonts load after first paint and can change the bar height - measure again.
    window.addEventListener('resize', measure);
    void document.fonts?.ready.then(measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      publish(0);
    };
  }, [isTopBar]);

  if (!ticker.enabled || isDismissed) {
    return null;
  }

  // (kept for ticker copy-code actions)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCopyCode = async (text: string) => {
    playClickSound();
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied code "${text}" to clipboard!`);
    } catch {
      showToast('Could not copy automatically — please copy it manually.');
    }
  };

  const isTop = ticker.position === 'top';
  const isBottom = ticker.position === 'bottom';
  const isFloating = ticker.position === 'floating';

  const positionClasses = isTop
    ? 'relative z-30 border-b'
    : isBottom
    ? 'fixed bottom-0 inset-x-0 z-30 border-t backdrop-blur-md'
    : 'fixed top-20 right-6 z-30 max-w-md rounded-2xl shadow-2xl border backdrop-blur-md animate-bounce-subtle';

  return (
    <div
      ref={rootRef}
      className={`py-2 px-4 transition-all duration-300 text-xs ${positionClasses}`}
      style={{
        backgroundColor: `${settings.theme.cardBackground}f5`,
        borderColor: `${settings.theme.primaryColor}35`,
        color: settings.theme.textColor,
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        {/* Left Badge & Content */}
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          <span 
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shrink-0 shadow-sm"
            style={{
              backgroundColor: `${settings.theme.primaryColor}25`,
              color: settings.theme.primaryColor,
              border: `1px solid ${settings.theme.primaryColor}50`,
            }}
          >
            {ticker.type === 'mosque_prayer' ? (
              <Moon className="w-3 h-3 text-emerald-400" />
            ) : ticker.type === 'offer' ? (
              <Tag className="w-3 h-3 text-amber-400" />
            ) : (
              <Sparkles className="w-3 h-3 text-amber-300" />
            )}
            {ticker.badgeText || 'LIVE UPDATE'}
          </span>

          {/* If Mosque Prayer Timings Type */}
          {ticker.type === 'mosque_prayer' && ticker.prayerTimes ? (
            <div className="flex items-center gap-3 overflow-x-auto py-0.5 text-[11px] no-scrollbar">
              <span className="font-medium text-emerald-300/90 whitespace-nowrap">
                🕌 Daily Prayer Schedule:
              </span>
              <div className="flex items-center gap-2 text-stone-300 font-mono text-[11px]">
                <span className="bg-stone-900/60 px-2 py-0.5 rounded border border-stone-800">Fajr: <b className="text-amber-200">{ticker.prayerTimes.fajr}</b></span>
                <span className="bg-stone-900/60 px-2 py-0.5 rounded border border-stone-800">Dhuhr: <b className="text-amber-200">{ticker.prayerTimes.dhuhr}</b></span>
                <span className="bg-stone-900/60 px-2 py-0.5 rounded border border-stone-800">Asr: <b className="text-amber-200">{ticker.prayerTimes.asr}</b></span>
                <span className="bg-stone-900/60 px-2 py-0.5 rounded border border-stone-800">Maghrib: <b className="text-amber-200">{ticker.prayerTimes.maghrib}</b></span>
                <span className="bg-stone-900/60 px-2 py-0.5 rounded border border-stone-800">Isha: <b className="text-amber-200">{ticker.prayerTimes.isha}</b></span>
              </div>
            </div>
          ) : (
            <p className="truncate text-stone-200 text-xs sm:text-[13px] font-medium tracking-wide">
              {ticker.message}
            </p>
          )}
        </div>

        {/* Right CTA link / code */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {ticker.linkText && ticker.linkUrl && (
            <a
              href={ticker.linkUrl}
              onClick={playClickSound}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors underline-offset-4 hover:underline"
            >
              <span>{ticker.linkText}</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          )}

          {/* Dismiss button if not locked */}
          {!ticker.isLocked && (
            <button
              onClick={() => {
                playClickSound();
                setIsDismissed(true);
              }}
              className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800/80 transition-colors ml-1"
              title="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
