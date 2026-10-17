'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Coupon } from '@/lib/types';
import { Tag, Plus, Trash2, Check, Sparkles, Send, Eye, EyeOff } from 'lucide-react';

export default function CouponsTab() {
  const { 
    settings, 
    updateSettings, 
    coupons, 
    addCoupon, 
    updateCoupon, 
    deleteCoupon, 
    showToast, 
    playClickSound 
  } = useCafe();

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(20);
  const [minOrder, setMinOrder] = useState(15);
  const [description, setDescription] = useState('Privilege discount for coffee lovers');
  const [validUntil, setValidUntil] = useState('2026-12-31');

  const primaryColor = settings.theme.primaryColor;

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (!code.trim()) return;
    if (!Number.isFinite(Number(discountValue)) || Number(discountValue) <= 0) {
      showToast('Please enter a valid discount value.');
      return;
    }

    addCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrder: Number.isFinite(Number(minOrder)) ? Number(minOrder) : 0,
      description,
      isActive: true,
      validUntil,
    });

    setCode('');
    setDescription('');
  };

  const broadcastToTicker = (coupon: Coupon) => {
    playClickSound();
    updateSettings({
      ticker: {
        ...settings.ticker,
        enabled: true,
        type: 'offer',
        badgeText: 'FLASH PRIVILEGE',
        message: `✨ Use promo code "${coupon.code}" for ${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : '$'} OFF on orders over ${settings.currency}${coupon.minOrder}!`,
        linkText: 'Order Menu',
        linkUrl: '#menu',
      },
    });
    showToast(`Broadcasted coupon "${coupon.code}" to the Live Announcement Bar!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800">
        <h3 className="text-base font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-400" />
          Atelier Privilege Coupons & Flash Offers
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Create promotional discount codes that customers can redeem in the cart drawer. You can also broadcast any active offer straight to the live marquee ticker!
        </p>
      </div>

      {/* Add Coupon Form */}
      <form 
        onSubmit={handleCreateCoupon}
        className="p-6 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-4"
      >
        <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">
          Create New Promo Code
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Coupon Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. VELVET25"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white uppercase focus:outline-none focus:border-amber-500 font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Discount Type
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="percentage">Percentage (% OFF)</option>
              <option value="fixed">Fixed Amount ($ OFF)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Discount Value {discountType === 'percentage' ? '(%)' : '($)'}
            </label>
            <input
              type="number"
              required
              value={Number.isNaN(discountValue) ? '' : discountValue}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Minimum Order ({settings.currency})
            </label>
            <input
              type="number"
              value={Number.isNaN(minOrder) ? '' : minOrder}
              onChange={(e) => setMinOrder(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
            Short Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 20% off all artisan pour-over orders over $15"
            className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5 shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Privilege Code</span>
          </button>
        </div>
      </form>

      {/* Coupons List */}
      <div className="space-y-3">
        <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">
          Active Privilege Offers ({coupons.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                c.isActive ? 'bg-stone-900/70 border-stone-800' : 'bg-stone-950/40 border-stone-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      {c.code}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {c.discountValue}{c.discountType === 'percentage' ? '%' : settings.currency} OFF
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">{c.description}</p>
                  <p className="text-[10px] text-stone-500 font-mono">
                    Min Order: {settings.currency}{c.minOrder} • Valid until: {c.validUntil || 'Indefinite'}
                  </p>
                </div>

                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-red-400"
                  title="Remove coupon"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                <button
                  onClick={() => updateCoupon(c.id, { isActive: !c.isActive })}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${
                    c.isActive ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-stone-800 border-stone-700 text-stone-400'
                  }`}
                >
                  {c.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{c.isActive ? 'Active' : 'Paused'}</span>
                </button>

                <button
                  onClick={() => broadcastToTicker(c)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-amber-300 border border-amber-500/40 bg-stone-900 hover:bg-stone-800 flex items-center gap-1.5"
                  title="Broadcast to website ticker banner"
                >
                  <Send className="w-3 h-3" />
                  <span>Broadcast to Marquee</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
