'use client';

import React from 'react';
import { useCafe } from '@/context/CafeContext';
import { Sparkles, CheckCircle } from 'lucide-react';

export default function Toast() {
  const { toastMessage, settings } = useCafe();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none max-w-sm">
      <div 
        className="px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-2.5 text-xs font-medium text-stone-100"
        style={{
          backgroundColor: `${settings.theme.cardBackground}f5`,
          borderColor: `${settings.theme.primaryColor}60`,
          boxShadow: `0 10px 30px rgba(0,0,0,0.8), 0 0 20px ${settings.theme.primaryColor}25`,
        }}
      >
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
