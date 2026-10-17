'use client';

import React from 'react';
import { useCafe } from '@/context/CafeContext';
import { 
  Coffee, 
  Calendar, 
  Tag, 
  Palette, 
  Film, 
  Database, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

interface OverviewTabProps {
  setActiveTab: (tab: string) => void;
}

export default function OverviewTab({ setActiveTab }: OverviewTabProps) {
  const { settings, updateSettings, menuItems, bookings, coupons, showToast, playClickSound } = useCafe();
  const primaryColor = settings.theme.primaryColor;

  const toggleTableBooking = () => {
    playClickSound();
    const current = settings.booking.enabled;
    updateSettings({
      booking: {
        ...settings.booking,
        enabled: !current,
      },
    });
    showToast(`Table booking feature is now ${!current ? 'ENABLED' : 'DISABLED (Menu-Only Mode)'}.`);
  };

  const toggleTicker = () => {
    playClickSound();
    const current = settings.ticker.enabled;
    updateSettings({
      ticker: {
        ...settings.ticker,
        enabled: !current,
      },
    });
    showToast(`Marquee Announcement Ticker is now ${!current ? 'ENABLED' : 'DISABLED'}.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div 
        className="p-6 sm:p-8 rounded-3xl border backdrop-blur-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #18110D 0%, #0D0907 100%)',
          borderColor: `${primaryColor}40`,
          boxShadow: `0 10px 40px rgba(0,0,0,0.6)`,
        }}
      >
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Executive Atelier Control Hub
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Welcome to {settings.siteName} Management
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed">
            Modify any aspect of your cinematic coffee shop website in real-time. Control 3D scroll animations, table reservation fields, menu pricing, theme aesthetics, and announcement tickers.
          </p>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Menu Offerings', count: menuItems.length, icon: Coffee, tab: 'menu' },
          { label: 'Active Bookings', count: bookings.length, icon: Calendar, tab: 'booking' },
          { label: 'Active Coupons', count: coupons.filter(c => c.isActive).length, icon: Tag, tab: 'coupons' },
          { label: 'Sections Configured', count: settings.sections.length, icon: Film, tab: 'sections' },
        ].map((stat, i) => (
          <div
            key={i}
            onClick={() => {
              playClickSound();
              setActiveTab(stat.tab);
            }}
            className="p-5 rounded-2xl border bg-stone-900/60 border-stone-800 hover:border-amber-500/40 cursor-pointer transition-all hover:scale-[1.02] space-y-2"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="w-5 h-5 text-amber-400" />
              <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-white">{stat.count}</p>
              <p className="text-[11px] uppercase tracking-wider text-stone-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Master Feature Toggles */}
      <div className="p-6 rounded-3xl border bg-stone-900/70 border-stone-800 space-y-4">
        <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-200">
          Master Atelier Feature Switches
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Table Booking Toggle */}
          <div className="p-4 rounded-2xl bg-black/40 border border-stone-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Table & Lounge Reservation Feature
              </h4>
              <p className="text-[11px] text-stone-400">
                {settings.booking.enabled ? 'Enabled • Customers can book tables online' : 'Disabled • Website is in pure Menu/Order mode'}
              </p>
            </div>
            <button
              onClick={toggleTableBooking}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                settings.booking.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'bg-red-500/20 text-red-300 border border-red-500/50'
              }`}
            >
              {settings.booking.enabled ? 'Active (ON)' : 'Disabled (OFF)'}
            </button>
          </div>

          {/* Marquee Ticker Toggle */}
          <div className="p-4 rounded-2xl bg-black/40 border border-stone-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Marquee / Mosque Updates Bar
              </h4>
              <p className="text-[11px] text-stone-400">
                {settings.ticker.enabled ? `Active at ${settings.ticker.position.toUpperCase()} (${settings.ticker.type})` : 'Disabled'}
              </p>
            </div>
            <button
              onClick={toggleTicker}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                settings.ticker.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'bg-red-500/20 text-red-300 border border-red-500/50'
              }`}
            >
              {settings.ticker.enabled ? 'Active (ON)' : 'Disabled (OFF)'}
            </button>
          </div>
        </div>
      </div>

      {/* Current Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Theme Status */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <Palette className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Theme Palette</h4>
          </div>
          <p className="text-sm font-semibold text-white capitalize">{settings.theme.preset.replace('-', ' ')}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: settings.theme.primaryColor }} title="Primary" />
            <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: settings.theme.accentColor }} title="Accent" />
            <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: settings.theme.backgroundColor }} title="Background" />
            <span className="text-[10px] text-stone-400 font-mono ml-auto">Glow: {settings.theme.glowIntensity}</span>
          </div>
        </div>

        {/* Animation Status */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <Film className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Animation Engine</h4>
          </div>
          <p className="text-sm font-semibold text-white capitalize">{settings.animation.scrollStyle.replace('-', ' ')}</p>
          <p className="text-[11px] text-stone-400">
            Loader: <b className="text-stone-200">{settings.animation.loadingStyle}</b> • Cursor: <b className="text-stone-200">{settings.animation.cursorStyle}</b>
          </p>
        </div>

        {/* Firebase Ready Bridge */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <Database className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Firebase Architecture</h4>
          </div>
          <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ready for Firestore</span>
          </p>
          <p className="text-[11px] text-stone-400">
            Export JSON or plug credentials anytime from the Firebase tab.
          </p>
        </div>
      </div>
    </div>
  );
}
