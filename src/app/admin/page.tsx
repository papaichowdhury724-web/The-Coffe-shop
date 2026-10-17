'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useCafe } from '@/context/CafeContext';
import AdminHeader from '@/components/admin/AdminHeader';
import Toast from '@/components/common/Toast';
import { 
  LayoutDashboard, 
  Layers, 
  Film, 
  Palette, 
  Coffee, 
  Calendar, 
  Tag, 
  Bell, 
  SlidersHorizontal, 
  Settings as SettingsIcon, 
  Database,
  Lock,
  Sparkles
} from 'lucide-react';

// Each tab is loaded only when it is opened, so the admin panel itself opens much faster.
const TabLoading = () => (
  <div className="p-8 text-xs font-mono text-stone-500 animate-pulse">Loading…</div>
);
const OverviewTab = dynamic(() => import('@/components/admin/tabs/OverviewTab'), { loading: TabLoading });
const SectionsTab = dynamic(() => import('@/components/admin/tabs/SectionsTab'), { loading: TabLoading });
const AnimationsTab = dynamic(() => import('@/components/admin/tabs/AnimationsTab'), { loading: TabLoading });
const ThemeTab = dynamic(() => import('@/components/admin/tabs/ThemeTab'), { loading: TabLoading });
const MenuTab = dynamic(() => import('@/components/admin/tabs/MenuTab'), { loading: TabLoading });
const BookingTab = dynamic(() => import('@/components/admin/tabs/BookingTab'), { loading: TabLoading });
const CouponsTab = dynamic(() => import('@/components/admin/tabs/CouponsTab'), { loading: TabLoading });
const TickerTab = dynamic(() => import('@/components/admin/tabs/TickerTab'), { loading: TabLoading });
const HeaderFooterTab = dynamic(() => import('@/components/admin/tabs/HeaderFooterTab'), { loading: TabLoading });
const SettingsTab = dynamic(() => import('@/components/admin/tabs/SettingsTab'), { loading: TabLoading });
const FirebaseTab = dynamic(() => import('@/components/admin/tabs/FirebaseTab'), { loading: TabLoading });

export default function AdminPage() {
  const { settings, playClickSound, isAdminLoggedIn, authReady, loginAdmin, showToast } = useCafe();
  const [activeTab, setActiveTab] = useState('overview');
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const primaryColor = settings.theme.primaryColor;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setIsLoggingIn(true);
    setLoginError('');
    const res = await loginAdmin(emailInput, passInput);
    setIsLoggingIn(false);
    if (res.success) {
      setPassInput('');
      showToast('Welcome to the Admin Studio.');
    } else {
      setLoginError(res.message);
    }
  };

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'sections', label: 'Sections & Media', icon: Layers },
    { id: 'animations', label: 'Animation Studio', icon: Film, badge: 'Live Previews' },
    { id: 'theme', label: 'Theme & Fonts', icon: Palette },
    { id: 'menu', label: 'Atelier Menu', icon: Coffee },
    { id: 'booking', label: 'Table Booking', icon: Calendar },
    { id: 'coupons', label: 'Offers & Coupons', icon: Tag },
    { id: 'ticker', label: 'Marquee / Mosque', icon: Bell },
    { id: 'headerFooter', label: 'Header & Footer', icon: SlidersHorizontal },
    { id: 'settings', label: 'Site Settings', icon: SettingsIcon },
    { id: 'firebase', label: 'Firebase Database', icon: Database, badge: 'Live' },
  ];

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400 text-xs font-mono"
        style={{ backgroundColor: settings.theme.backgroundColor }}>
        Checking login...
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 bg-black text-white"
        style={{ backgroundColor: settings.theme.backgroundColor }}
      >
        <div 
          className="w-full max-w-md p-8 rounded-3xl border shadow-2xl text-center space-y-6"
          style={{
            backgroundColor: settings.theme.cardBackground,
            borderColor: `${primaryColor}40`,
          }}
        >
          <div 
            className="w-16 h-16 rounded-full border mx-auto flex items-center justify-center"
            style={{ borderColor: primaryColor }}
          >
            <Lock className="w-8 h-8 text-amber-300" />
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold text-white">
              {settings.siteName} ADMIN
            </h2>
            <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">
              Sign in with your admin email
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              required
              autoComplete="username"
              placeholder="Admin email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-stone-800 text-sm text-center text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-stone-800 text-sm text-center text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            {loginError && (
              <p className="text-xs text-red-400 font-mono">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-widest text-black shadow-xl disabled:opacity-60"
              style={{ backgroundColor: primaryColor }}
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-stone-100 flex flex-col"
      style={{
        backgroundColor: settings.theme.backgroundColor,
      }}
    >
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <Toast />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-1.5">
          <div className="pb-3 px-3 text-[10px] font-mono uppercase tracking-widest text-stone-400">
            Control Navigation
          </div>

          <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClickSound();
                    setActiveTab(tab.id);
                  }}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between whitespace-nowrap transition-all w-full text-left ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50 shadow-md font-bold'
                      : 'bg-stone-900/40 text-stone-400 hover:text-white hover:bg-stone-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <tab.icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge && (
                    <span 
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase"
                      style={{
                        backgroundColor: `${primaryColor}20`,
                        color: primaryColor,
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
          {activeTab === 'sections' && <SectionsTab />}
          {activeTab === 'animations' && <AnimationsTab />}
          {activeTab === 'theme' && <ThemeTab />}
          {activeTab === 'menu' && <MenuTab />}
          {activeTab === 'booking' && <BookingTab />}
          {activeTab === 'coupons' && <CouponsTab />}
          {activeTab === 'ticker' && <TickerTab />}
          {activeTab === 'headerFooter' && <HeaderFooterTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'firebase' && <FirebaseTab />}
        </main>
      </div>
    </div>
  );
}
