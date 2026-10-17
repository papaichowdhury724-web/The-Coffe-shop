'use client';

import React, { useEffect, useRef } from 'react';
import { useCafe } from '@/context/CafeContext';

/**
 * Custom cursor driven entirely by refs + transforms.
 * No React state is touched on mouse-move or per animation frame, so the cursor
 * costs almost nothing and never triggers a re-render of anything.
 */
export default function CustomCursor() {
  const { settings } = useCafe();
  const cursorStyle = settings.animation.cursorStyle;
  const primaryColor = settings.theme.primaryColor;

  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cursorStyle === 'default') return;
    if (!window.matchMedia('(pointer: fine)').matches) return; // desktop / laptop only

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let hovering = false;
    let clicking = false;
    let visible = false;
    let raf = 0;
    let lastTime = 0;

    const applyRing = () => {
      const size = hovering ? 44 : 30;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.backgroundColor = hovering ? `${primaryColor}22` : 'transparent';
      ring.style.boxShadow = hovering ? `0 0 16px ${primaryColor}80` : 'none';
    };

    const draw = (now: number) => {
      const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60;
      lastTime = now;

      // frame-rate independent trailing
      const k = 1 - Math.exp(-12 * dt);
      rx += (x - rx) * k;
      ry += (y - ry) * k;

      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${clicking ? 0.75 : 1})`;

      if (Math.abs(x - rx) < 0.1 && Math.abs(y - ry) < 0.1) {
        raf = 0;
        lastTime = 0;
        return;
      }
      raf = requestAnimationFrame(draw);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const setVisible = (v: boolean) => {
      if (v === visible) return;
      visible = v;
      const o = v ? '1' : '0';
      ring.style.opacity = o;
      dot.style.opacity = o;
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        rx = x;
        ry = y;
        setVisible(true);
      }
      const t = e.target as HTMLElement | null;
      const next = !!(t && (t.closest('button, a, input, textarea, select, [role="button"]')));
      if (next !== hovering) {
        hovering = next;
        applyRing();
      }
      start();
    };
    const onDown = () => {
      clicking = true;
      start();
    };
    const onUp = () => {
      clicking = false;
      start();
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    applyRing();
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, [cursorStyle, primaryColor]);

  if (cursorStyle === 'default') return null;

  return (
    <>
      {/* Outer halo / trailing ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed left-0 top-0 pointer-events-none z-50 rounded-full mix-blend-screen hidden [@media(pointer:fine)]:block"
        style={{
          width: '30px',
          height: '30px',
          opacity: 0,
          transform: 'translate3d(-100px, -100px, 0)',
          border: `1.5px solid ${primaryColor}88`,
          transition: 'width 150ms, height 150ms, background-color 150ms, box-shadow 150ms, opacity 200ms',
          willChange: 'transform',
        }}
      />

      {/* Main cursor centre */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed left-0 top-0 pointer-events-none z-50 hidden [@media(pointer:fine)]:block"
        style={{
          opacity: 0,
          transform: 'translate3d(-100px, -100px, 0)',
          transition: 'opacity 200ms',
          willChange: 'transform',
        }}
      >
        {cursorStyle === 'coffee-bean' ? (
          <div
            className="w-4 h-3 rounded-[40%] relative flex items-center justify-center rotate-45 shadow-lg"
            style={{ backgroundColor: '#3E2214', border: `1px solid ${primaryColor}` }}
          >
            <div className="w-0.5 h-3 bg-amber-200/90 rounded-full" />
          </div>
        ) : cursorStyle === 'golden-ring' ? (
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: primaryColor, boxShadow: `0 0 8px ${primaryColor}` }}
          />
        ) : (
          <div className="w-2 h-2 rounded-full bg-amber-100 shadow-md" />
        )}
      </div>
    </>
  );
}
