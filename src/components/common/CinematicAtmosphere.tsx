'use client';

import React, { useEffect, useRef } from 'react';
import { useCafe } from '@/context/CafeContext';

const chapters = ['Awaken', 'Origin', 'Alchemy', 'Atelier', 'Sanctuary'];

export default function CinematicAtmosphere() {
  const { settings } = useCafe();
  const progressRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // The chapter indicator is hidden below md, so don't spend scroll work on it on phones.
    if (!window.matchMedia('(min-width: 768px)').matches) return;
    let raf = 0;
    let smooth = 0;
    let target = 0;
    let last = performance.now();
    let lastChapter = -1;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      smooth += (target - smooth) * (1 - Math.exp(-6 * dt));
      if (progressRef.current) progressRef.current.style.transform = `scaleY(${Math.max(0.015, smooth)})`;
      const idx = Math.min(chapters.length - 1, Math.floor(smooth * chapters.length));
      if (idx !== lastChapter && chapterRef.current) {
        lastChapter = idx;
        chapterRef.current.textContent = `${String(idx + 1).padStart(2, '0')} · ${chapters[idx]}`;
      }
      raf = Math.abs(target - smooth) > 0.0005 ? requestAnimationFrame(tick) : 0;
    };

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      target = Math.min(1, Math.max(0, window.scrollY / max));
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="film-grain absolute inset-[-50%] opacity-[0.045]" />

      <div className="fixed left-4 sm:left-7 top-1/2 -translate-y-1/2 hidden md:flex h-36 items-center gap-3 opacity-70">
        <div className="relative h-full w-px bg-white/10 overflow-hidden">
          <div
            ref={progressRef}
            className="absolute inset-0 origin-top will-change-transform"
            style={{ background: `linear-gradient(to bottom, ${settings.theme.primaryColor}, ${settings.theme.accentColor})` }}
          />
        </div>
        <span ref={chapterRef} className="vertical-chapter text-[9px] font-mono uppercase tracking-[0.3em] text-amber-200/70">
          01 · Awaken
        </span>
      </div>
    </div>
  );
}
