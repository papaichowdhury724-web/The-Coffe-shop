'use client';

import { useEffect } from 'react';

let lockCount = 0;
let previousOverflow = '';

/**
 * Locks page scrolling while a modal / drawer is open (ref-counted so nested
 * overlays don't unlock each other). Stops the page scrolling behind the
 * overlay on phones.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount++;
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}
