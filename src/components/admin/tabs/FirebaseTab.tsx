'use client';

import React from 'react';
import { useCafe } from '@/context/CafeContext';
import { Database, Download, UploadCloud, ShieldCheck } from 'lucide-react';
import { COLLECTIONS } from '@/lib/firebase';

export default function FirebaseTab() {
  const { settings, menuItems, bookings, coupons, reviews, adminEmail, showToast, playClickSound, seedDefaults } = useCafe();
  const primaryColor = settings.theme.primaryColor;

  const handleBackup = () => {
    playClickSound();
    const byId = <T extends { id: string }>(list: T[]) => list.reduce((acc, x) => ({ ...acc, [x.id]: x }), {});
    const data = {
      exportedAt: new Date().toISOString(),
      collections: {
        [COLLECTIONS.SETTINGS]: { general: settings },
        [COLLECTIONS.MENU_ITEMS]: byId(menuItems),
        [COLLECTIONS.TABLE_BOOKINGS]: byId(bookings),
        [COLLECTIONS.COUPONS]: byId(coupons),
        [COLLECTIONS.REVIEWS]: byId(reviews),
      },
    };
    const a = document.createElement('a');
    a.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    a.download = `coffee_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Backup downloaded.');
  };

  const handleReseed = async () => {
    if (!confirm('This will overwrite the menu, settings, coupons and reviews in Firebase with the original defaults. Continue?')) return;
    playClickSound();
    await seedDefaults();
  };

  const cards = [
    { path: `/${COLLECTIONS.SETTINGS}/general`, name: 'Site settings', count: '1 doc', desc: 'Branding, theme, animations, sections, header/footer, booking rules, ticker' },
    { path: `/${COLLECTIONS.MENU_ITEMS}/{id}`, name: 'Menu', count: `${menuItems.length} docs`, desc: 'Coffee, food and drinks' },
    { path: `/${COLLECTIONS.TABLE_BOOKINGS}/{id}`, name: 'Table bookings', count: `${bookings.length} docs`, desc: 'Customer reservations (private - admin only)' },
    { path: `/${COLLECTIONS.COUPONS}/{id}`, name: 'Coupons', count: `${coupons.length} docs`, desc: 'Discount codes' },
    { path: `/${COLLECTIONS.REVIEWS}/{id}`, name: 'Reviews', count: `${reviews.length} docs`, desc: 'Guest reviews and approvals' },
  ];

  return (
    <div className="space-y-8">
      <div className="p-6 sm:p-8 rounded-3xl border space-y-3"
        style={{ background: 'linear-gradient(135deg, #18110D 0%, #0D0907 100%)', borderColor: `${primaryColor}40` }}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
          <ShieldCheck className="w-3.5 h-3.5" />
          Connected to Firebase
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">Firebase Database</h2>
        <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed">
          Project <b className="text-amber-300">coffeshop-3d</b>
          {adminEmail ? <> - logged in as <b className="text-amber-300">{adminEmail}</b></> : null}.
          Everything you change here is saved live to Firestore and shows on the website for every visitor.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <button onClick={handleBackup}
            className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-transform"
            style={{ backgroundColor: primaryColor }}>
            <Download className="w-4 h-4" />
            <span>Download Backup (JSON)</span>
          </button>
          <button onClick={handleReseed}
            className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-stone-200 border border-stone-700 bg-stone-900/70 flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform">
            <UploadCloud className="w-4 h-4" />
            <span>Re-upload Default Data</span>
          </button>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
        <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-400" /> Firestore Collections
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.path} className="p-4 rounded-2xl bg-black/40 border border-stone-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-300">{c.count}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Live</span>
              </div>
              <h4 className="text-xs font-bold text-white">{c.name}</h4>
              <p className="font-mono text-[10px] text-stone-400 bg-stone-900/80 px-2 py-1 rounded truncate">{c.path}</p>
              <p className="text-[11px] text-stone-400">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
