'use client';

import { useEffect } from 'react';
import { useCafe } from '@/context/CafeContext';

/**
 * Momentum ("inertia") scrolling for pointer devices.
 *
 * Drives the native scroll position via window.scrollTo on a rAF loop, so
 * position:sticky / position:fixed and the real scrollbar keep working — unlike
 * transform-based smooth scrollers. Touch devices keep their native momentum,
 * which is already better than anything we can emulate.
 */

/** True when `el` can still absorb a wheel delta of `dy` itself. */
function absorbsScroll(el: Element, dy: number): boolean {
  const overflowY = getComputedStyle(el).overflowY;
  if (overflowY !== 'auto' && overflowY !== 'scroll') return false;

  const max = el.scrollHeight - el.clientHeight;
  if (max <= 1) return false;
  if (dy < 0 && el.scrollTop <= 0) return false;
  if (dy > 0 && el.scrollTop >= max - 1) return false;
  return true;
}

export default function SmoothScroll() {
  const { settings } = useCafe();
  const optedOut = settings.animation.reducedMotion;

  useEffect(() => {
    if (optedOut) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    // Our loop calls scrollTo every frame; CSS smooth scrolling would fight it.
    root.style.scrollBehavior = 'auto';

    let target = window.scrollY;
    let current = target;
    let raf = 0;
    let lastTime = 0;

    const limit = () => Math.max(0, root.scrollHeight - window.innerHeight);
    const clamp = (v: number) => Math.min(limit(), Math.max(0, v));

    const frame = (now: number) => {
      const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60;
      lastTime = now;

      const diff = target - current;
      if (Math.abs(diff) < 0.15) {
        current = target;
        window.scrollTo(0, current);
        raf = 0;
        lastTime = 0;
        return;
      }

      // Frame-rate independent easing: identical feel at 60Hz and 144Hz.
      current += diff * (1 - Math.exp(-9 * dt));
      window.scrollTo(0, current);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented) return; // pinch-zoom

      // Let overlays and inner scroll areas keep native behaviour.
      let node: Element | null = e.target as Element | null;
      while (node && node !== document.body) {
        if (node.hasAttribute('data-native-scroll')) return;
        if (absorbsScroll(node, e.deltaY)) return;
        node = node.parentElement;
      }

      e.preventDefault();
      const delta =
        e.deltaMode === 1
          ? e.deltaY * 18 // lines
          : e.deltaMode === 2
            ? e.deltaY * window.innerHeight // pages
            : e.deltaY;

      target = clamp(target + delta);
      start();
    };

    // Resync when something else moves the page (scrollbar drag, keyboard, hash jump).
    const onScroll = () => {
      if (Math.abs(window.scrollY - current) > 2) {
        current = window.scrollY;
        target = window.scrollY;
      }
    };

    // Animate in-page anchors with the same easing instead of a hard jump.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const target0 = e.target as Element | null;
      const link = target0?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link) return;

      const hash = link.getAttribute('href');
      if (!hash || hash.length < 2) return;

      let dest: Element | null = null;
      try {
        dest = document.querySelector(hash);
      } catch {
        return; // not a valid selector
      }
      if (!dest) return;

      e.preventDefault();
      target = clamp(window.scrollY + dest.getBoundingClientRect().top - 88);
      start();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
      root.style.scrollBehavior = previousBehavior;
    };
  }, [optedOut]);

  return null;
}
