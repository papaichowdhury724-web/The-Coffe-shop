'use client';

import React, { useState, useEffect } from 'react';
import { useCafe } from '@/context/CafeContext';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  Download, 
  Share2, 
  QrCode, 
  Coffee 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TableBookingRecord } from '@/lib/types';
import { useScrollLock } from '@/lib/useScrollLock';

export default function TableBookingModal() {
  const { 
    settings, 
    brandName,
    isBookingModalOpen, 
    setIsBookingModalOpen, 
    selectedBookingArea, 
    setSelectedBookingArea,
    addBooking, 
    playClickSound, 
    showToast 
  } = useCafe();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('07:30 PM');
  const [guests, setGuests] = useState(2);
  const [seatingArea, setSeatingArea] = useState(selectedBookingArea || 'The Velvet Booth Lounge');
  const [occasion, setOccasion] = useState('Intimate Coffee Date');
  const [specialRequest, setSpecialRequest] = useState('');

  const [confirmedBooking, setConfirmedBooking] = useState<TableBookingRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The modal stays mounted, so useState's initial value is only read once —
  // pick up the seating area chosen in the booking section every time it opens.
  useEffect(() => {
    if (isBookingModalOpen && selectedBookingArea) {
      setSeatingArea(selectedBookingArea);
    }
  }, [isBookingModalOpen, selectedBookingArea]);

  useScrollLock(isBookingModalOpen && settings.booking.enabled);

  if (!isBookingModalOpen || !settings.booking.enabled) {
    return null;
  }

  const { fields, seatingAreas, timeSlots, maxPartySize } = settings.booking;
  const primaryColor = settings.theme.primaryColor;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();

    // Check mandatory fields dynamically
    if (fields.name.visible && fields.name.required && !name.trim()) {
      showToast('Please enter your full name.');
      return;
    }
    if (fields.phone.visible && fields.phone.required && !phone.trim()) {
      showToast('Please provide a valid phone number.');
      return;
    }
    if (fields.email.visible && fields.email.required && !email.trim()) {
      showToast('Please provide your email address.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newBk = addBooking({
        name: name || 'Guest',
        phone: phone || 'N/A',
        email: email || undefined,
        date,
        timeSlot,
        guests: Number(guests),
        seatingArea,
        occasion: occasion || undefined,
        specialRequest: specialRequest || undefined,
      });

      setConfirmedBooking(newBk);
      setIsSubmitting(false);

      // Trigger Luxury Golden Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#E0A96D', '#F5E6D3', '#8C5229'],
        });
      } catch {
        // confetti fallback
      }
    }, 600);
  };

  const handleClose = () => {
    playClickSound();
    setIsBookingModalOpen(false);
    setConfirmedBooking(null);
    setSelectedBookingArea(null);
  };

  return (
    <div data-native-scroll className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className="w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-300"
        style={{
          backgroundColor: settings.theme.cardBackground,
          borderColor: `${primaryColor}40`,
        }}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-stone-800/80 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-full border flex items-center justify-center"
              style={{ borderColor: primaryColor }}
            >
              <Calendar className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                {confirmedBooking ? 'Atelier Digital Pass' : 'Sanctuary Reservation'}
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-amber-400/80">
                {brandName} Experience
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-stone-900 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-stone-200">
          {confirmedBooking ? (
            /* Digital Pass View */
            <div className="space-y-6 animate-in fade-in duration-500">
              <div 
                className="p-6 sm:p-8 rounded-3xl border relative overflow-hidden text-center"
                style={{
                  background: 'linear-gradient(145deg, #18110D 0%, #0E0907 100%)',
                  borderColor: `${primaryColor}60`,
                  boxShadow: `0 0 35px ${primaryColor}20`,
                }}
              >
                {/* Golden Watermark */}
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full border border-amber-500/10 pointer-events-none" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-4">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Reservation Confirmed
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">
                  {confirmedBooking.name}
                </h2>
                <p className="text-xs font-mono text-amber-400 tracking-widest">
                  PASS REF: {confirmedBooking.bookingRef}
                </p>

                {/* Reservation Details Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 p-4 rounded-2xl bg-black/50 border border-stone-800 text-left">
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 block">Date</span>
                    <span className="text-xs font-bold text-white">{confirmedBooking.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 block">Time</span>
                    <span className="text-xs font-bold text-amber-300">{confirmedBooking.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 block">Guests</span>
                    <span className="text-xs font-bold text-white">{confirmedBooking.guests} Persons</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 block">Area</span>
                    <span className="text-xs font-bold text-white truncate block">{confirmedBooking.seatingArea}</span>
                  </div>
                </div>

                {/* QR Code Simulation */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 max-w-xs mx-auto">
                  <QrCode className="w-24 h-24 text-amber-200 mb-2" />
                  <span className="text-[10px] font-mono text-stone-400">
                    SCAN AT ROASTERY CONCIERGE
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => {
                    playClickSound();
                    showToast('Digital pass saved to device.');
                  }}
                  className="w-full sm:flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-black flex items-center justify-center gap-2 shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Download className="w-4 h-4" />
                  <span>Download Pass</span>
                </button>

                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-stone-300 bg-stone-900 border border-stone-800 hover:text-white"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seating Area Selection */}
              {fields.seatingArea.visible && (
                <div>
                  <label className="text-xs uppercase font-semibold tracking-wider text-stone-300 block mb-2.5">
                    1. Choose Sanctuary Seating Zone {fields.seatingArea.required && <span className="text-amber-400">*</span>}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {seatingAreas.map((area) => (
                      <div
                        key={area.id}
                        onClick={() => {
                          playClickSound();
                          setSeatingArea(area.name);
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center gap-3 ${
                          seatingArea === area.name
                            ? 'bg-amber-500/15 border-amber-500 shadow-md scale-[1.01]'
                            : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <img loading="lazy" decoding="async" 
                          src={area.image} 
                          alt={area.name} 
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-white truncate">{area.name}</h4>
                          <span className="text-[10px] font-mono text-amber-300">{area.capacity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date, Time & Guests Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {fields.date.visible && (
                  <div>
                    <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                      Date {fields.date.required && <span className="text-amber-400">*</span>}
                    </label>
                    <input
                      type="date"
                      required={fields.date.required}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                {fields.timeSlot.visible && (
                  <div>
                    <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                      Time Slot {fields.timeSlot.required && <span className="text-amber-400">*</span>}
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                )}

                {fields.guests.visible && (
                  <div>
                    <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                      Guests {fields.guests.required && <span className="text-amber-400">*</span>}
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {Array.from({ length: maxPartySize || 8 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Guest Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fields.name.visible && (
                  <div>
                    <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                      {fields.name.label} {fields.name.required && <span className="text-amber-400">*</span>}
                    </label>
                    <input
                      type="text"
                      required={fields.name.required}
                      placeholder="e.g. Elena Rostova"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                {fields.phone.visible && (
                  <div>
                    <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                      {fields.phone.label} {fields.phone.required && <span className="text-amber-400">*</span>}
                    </label>
                    <input
                      type="tel"
                      required={fields.phone.required}
                      placeholder="e.g. +1 555-0192"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                {fields.email.visible && (
                  <div className="sm:col-span-2">
                    <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                      {fields.email.label} {fields.email.required && <span className="text-amber-400">*</span>}
                    </label>
                    <input
                      type="email"
                      required={fields.email.required}
                      placeholder="e.g. elena@specialtycoffee.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Special Occasion & Notes */}
              {fields.occasion.visible && (
                <div>
                  <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                    Occasion / Experience Type
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Intimate Coffee Date">Intimate Coffee Date</option>
                    <option value="Single-Origin Cupping Flight">Single-Origin Cupping Flight</option>
                    <option value="Anniversary & Celebration">Anniversary & Celebration</option>
                    <option value="Business Tasting Meeting">Business Tasting Meeting</option>
                    <option value="Casual Gathering">Casual Gathering</option>
                  </select>
                </div>
              )}

              {fields.specialRequest.visible && (
                <div>
                  <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                    Dietary or Seating Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Quiet booth preferred, oat milk pairing..."
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Policy Text Notice */}
              <div className="p-3 rounded-xl bg-stone-900/50 border border-stone-800 text-[11px] text-stone-400">
                <span className="text-amber-400 font-semibold">Atelier Policy: </span>
                {settings.booking.policyText}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-black shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {isSubmitting ? (
                  <span>Securing Table...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm Atelier Reservation</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
