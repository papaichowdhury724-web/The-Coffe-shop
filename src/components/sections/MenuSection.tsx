'use client';

import React, { useMemo, useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Sparkles } from 'lucide-react';

/** Big preview photo — ask the image host for a sensible size instead of 1200px wide. */
function preview(url: string): string {
  if (url.includes('images.pexels.com')) return url.replace(/([?&])h=\d+&w=\d+/, '$1h=900&w=760');
  return url;
}

/**
 * View-only menu: category tabs, a large photo on the left and an elegant
 * name ····· price list on the right. No cart, no ordering.
 */
export default function MenuSection() {
  const { settings, menuItems, playClickSound } = useCafe();
  const primaryColor = settings.theme.primaryColor;

  const categories = useMemo(() => {
    const seen: string[] = [];
    [...menuItems]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .forEach((i) => {
        if (!seen.includes(i.category)) seen.push(i.category);
      });
    return seen;
  }, [menuItems]);

  const [selected, setSelected] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeCategory = categories.includes(selected) ? selected : categories[0];
  const items = useMemo(
    () => menuItems.filter((i) => i.category === activeCategory),
    [menuItems, activeCategory]
  );

  const shown = items.find((i) => i.id === hoveredId) ?? items[0];

  const formatPrice = (value: number) =>
    `${settings.currency}${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  return (
    <section id="menu" className="relative py-14 sm:py-24 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-[0.25em] uppercase mb-4 border"
            style={{
              backgroundColor: `${settings.theme.cardBackground}90`,
              borderColor: `${primaryColor}40`,
              color: primaryColor,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Menu</span>
          </div>

          <h2
            className="text-3xl sm:text-5xl font-serif font-light tracking-wide uppercase mb-3"
            style={{ color: settings.theme.textColor }}
          >
            The Atelier Menu
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm font-light max-w-xl mx-auto">
            From single-origin pour-overs to micro-foam Spanish lattes and freshly baked Valrhona pastries.
          </p>
        </div>

        {/* Category tabs */}
        {categories.length > 1 && (
          <div className="flex justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2 mb-8 sm:mb-12">
            {categories.map((cat) => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    playClickSound();
                    setSelected(cat);
                    setHoveredId(null);
                  }}
                  className="shrink-0 px-4 sm:px-6 py-2.5 text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em] border transition-colors whitespace-nowrap"
                  style={{
                    backgroundColor: active ? primaryColor : 'transparent',
                    borderColor: active ? primaryColor : `${primaryColor}35`,
                    color: active ? '#0A0807' : settings.theme.textColor,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-stone-800 rounded-2xl">
            <p className="text-stone-400 text-sm">The menu is being prepared. Please check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Photo */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div
                className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/5] overflow-hidden border"
                style={{ borderColor: `${primaryColor}25`, backgroundColor: settings.theme.cardBackground }}
              >
                {shown && (
                  <img
                    key={shown.id}
                    loading="lazy"
                    decoding="async"
                    src={preview(shown.image)}
                    alt={shown.name}
                    className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* List */}
            <ul className="lg:col-span-7 divide-y" style={{ borderColor: `${primaryColor}30` }}>
              {items.map((item) => (
                <li
                  key={item.id}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onClick={() => setHoveredId(item.id)}
                  className={`py-5 sm:py-6 first:pt-0 cursor-default transition-opacity ${
                    item.isAvailable ? '' : 'opacity-50'
                  }`}
                  style={{ borderColor: `${primaryColor}30` }}
                >
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <h3
                      className="text-lg sm:text-2xl font-serif leading-snug"
                      style={{ color: settings.theme.textColor }}
                    >
                      {item.name}
                    </h3>

                    {item.badge && (
                      <span
                        className="shrink-0 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.18em] border self-center"
                        style={{ color: primaryColor, borderColor: `${primaryColor}70` }}
                      >
                        {item.badge}
                      </span>
                    )}

                    <span
                      className="flex-1 min-w-3 border-b border-dotted translate-y-[-5px]"
                      style={{ borderColor: `${primaryColor}45` }}
                      aria-hidden="true"
                    />

                    <span
                      className="shrink-0 text-lg sm:text-2xl font-serif"
                      style={{ color: primaryColor }}
                    >
                      {item.isAvailable ? formatPrice(item.price) : 'Sold out'}
                    </span>
                  </div>

                  {item.description && (
                    <p className="mt-2 text-xs sm:text-sm text-stone-400 font-light leading-relaxed max-w-xl">
                      {item.description}
                    </p>
                  )}

                  {(item.origin || (item.flavorNotes && item.flavorNotes.length > 0)) && (
                    <p className="mt-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-stone-500">
                      {[item.origin, ...(item.flavorNotes ?? []).slice(0, 3)].filter(Boolean).join('  ·  ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
