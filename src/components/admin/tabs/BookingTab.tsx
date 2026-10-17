'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { TableBookingRecord, BookingFieldConfig } from '@/lib/types';
import { 
  Calendar, 
  Check, 
  X, 
  Trash2, 
  Search, 
  Download, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  Filter 
} from 'lucide-react';

export default function BookingTab() {
  const { 
    settings, 
    updateSettings, 
    bookings, 
    updateBookingStatus, 
    deleteBooking, 
    showToast, 
    playClickSound 
  } = useCafe();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'seated' | 'cancelled'>('all');

  const primaryColor = settings.theme.primaryColor;
  const bookingConfig = settings.booking;
  const fields = bookingConfig.fields;

  const toggleFieldSetting = (fieldKey: keyof typeof fields, property: 'visible' | 'required') => {
    playClickSound();
    const current = fields[fieldKey][property];
    const updated = {
      ...fields,
      [fieldKey]: {
        ...fields[fieldKey],
        [property]: !current,
      },
    };
    updateSettings({
      booking: {
        ...bookingConfig,
        fields: updated,
      },
    });
    showToast(`Updated "${fields[fieldKey].label}" field rule.`);
  };

  const handleExportCSV = () => {
    playClickSound();
    const headers = ['Booking Ref', 'Name', 'Phone', 'Email', 'Date', 'Time Slot', 'Guests', 'Area', 'Status', 'Created At'];
    const rows = bookings.map(b => [
      b.bookingRef,
      `"${b.name}"`,
      `"${b.phone}"`,
      `"${b.email || ''}"`,
      b.date,
      b.timeSlot,
      b.guests,
      `"${b.seatingArea}"`,
      b.status,
      b.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auranoir_bookings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported reservations to CSV!');
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* 1. Master Table Booking Switch */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            Table & Sanctuary Booking Master Engine
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Toggle table booking feature ON/OFF globally. When disabled, the entire website seamlessly switches to menu & delivery mode!
          </p>
        </div>

        <button
          onClick={() => {
            playClickSound();
            const current = bookingConfig.enabled;
            updateSettings({
              booking: { ...bookingConfig, enabled: !current },
            });
            showToast(`Table booking is now ${!current ? 'ACTIVATED' : 'DEACTIVATED'}.`);
          }}
          className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
            bookingConfig.enabled
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60'
              : 'bg-red-500/20 text-red-300 border border-red-500/60'
          }`}
        >
          {bookingConfig.enabled ? 'Feature Status: ACTIVE (ON)' : 'Feature Status: DISABLED (OFF)'}
        </button>
      </div>

      {/* 2. Customer Booking Form Fields Mandatory/Visibility Builder */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div>
          <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
            Booking Form Mandatory & Visibility Rules
          </h4>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure which input details customers MUST fill in during reservation, and which fields can be optional or hidden.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(fields) as (keyof typeof fields)[]).map((key) => {
            const field = fields[key];
            return (
              <div
                key={key}
                className="p-3.5 rounded-2xl bg-black/40 border border-stone-800/80 flex items-center justify-between gap-2"
              >
                <div>
                  <h5 className="text-xs font-bold text-white">{field.label}</h5>
                  <span className="text-[10px] font-mono text-stone-400">ID: {field.id}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Visible Toggle */}
                  <button
                    onClick={() => toggleFieldSetting(key, 'visible')}
                    className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                      field.visible
                        ? 'bg-stone-800 text-stone-200 border-stone-700'
                        : 'bg-stone-950 text-stone-500 border-stone-900'
                    }`}
                    title="Toggle Visibility"
                  >
                    {field.visible ? 'Visible' : 'Hidden'}
                  </button>

                  {/* Required Toggle */}
                  <button
                    onClick={() => toggleFieldSetting(key, 'required')}
                    className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                      field.required
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : 'bg-stone-900 text-stone-400 border-stone-800'
                    }`}
                    title="Toggle Required Mandatory"
                  >
                    {field.required ? 'Mandatory' : 'Optional'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Live Customer Table Reservations List */}
      <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
              Live Reservations & Guest Passes ({bookings.length})
            </h4>
            <p className="text-xs text-stone-400">
              Manage booking approvals, guest seating status, and notes.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-300 border border-amber-500/40 bg-stone-900 hover:bg-stone-800 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            {['all', 'pending', 'confirmed', 'seated', 'cancelled'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st as typeof statusFilter)}
                className={`px-3 py-1 rounded-full text-xs capitalize border ${
                  statusFilter === st ? 'bg-amber-500/20 text-amber-300 border-amber-500' : 'bg-stone-900 border-stone-800 text-stone-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ref, guest name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-full text-xs bg-stone-900 border border-stone-800 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Table / List */}
        <div className="space-y-3 pt-2">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-black/50 border border-stone-800/80 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {b.bookingRef}
                  </span>
                  <h5 className="text-xs font-bold text-white">{b.name}</h5>
                  <span className="text-[10px] text-stone-400">({b.guests} Guests)</span>
                </div>

                <p className="text-[11px] text-stone-400">
                  📅 {b.date} • ⏰ {b.timeSlot} • 📍 {b.seatingArea}
                </p>

                {b.phone && <p className="text-[10px] text-stone-500">Phone: {b.phone} {b.email ? `• Email: ${b.email}` : ''}</p>}
                {b.specialRequest && (
                  <p className="text-[10px] text-amber-300/80 italic mt-0.5">
                    &ldquo;{b.specialRequest}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* Status Selector */}
                <select
                  value={b.status}
                  onChange={(e) => updateBookingStatus(b.id, e.target.value as TableBookingRecord['status'])}
                  className={`text-xs px-2.5 py-1.5 rounded-xl border bg-stone-900 font-semibold uppercase tracking-wider ${
                    b.status === 'confirmed' ? 'text-emerald-300 border-emerald-500/40' :
                    b.status === 'seated' ? 'text-cyan-300 border-cyan-500/40' :
                    b.status === 'cancelled' ? 'text-red-400 border-red-500/40' :
                    'text-amber-300 border-amber-500/40'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="seated">Seated</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => {
                    if (confirm(`Delete reservation for ${b.name}?`)) {
                      deleteBooking(b.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-red-400"
                  title="Delete reservation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredBookings.length === 0 && (
            <div className="text-center py-12 text-stone-500 text-xs">
              No reservations found matching the current search or filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
