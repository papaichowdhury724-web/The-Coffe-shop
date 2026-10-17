'use client';

import React from 'react';
import { useCafe } from '@/context/CafeContext';
import { MapPin, Clock, Phone, Mail, Navigation, ExternalLink, Calendar } from 'lucide-react';

export default function LocationSection() {
  const { settings, setIsBookingModalOpen, playClickSound } = useCafe();
  const footer = settings.footer;
  const primaryColor = settings.theme.primaryColor;

  return (
    <section id="visit" className="relative py-28 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Info Card */}
          <div className="lg:col-span-5 space-y-6">
            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-[0.25em] uppercase backdrop-blur-md border"
              style={{
                backgroundColor: `${settings.theme.cardBackground}90`,
                borderColor: `${primaryColor}40`,
                color: primaryColor,
              }}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Sanctuary & Hours</span>
            </div>

            <h2 
              className="text-3xl sm:text-5xl font-serif font-light tracking-wide uppercase leading-tight"
              style={{ color: settings.theme.textColor }}
            >
              Step Inside the Atelier
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-stone-300">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-stone-900/60 border border-stone-800">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Roastery Address</h4>
                  <p className="text-stone-300 text-xs mt-0.5">{footer.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-stone-900/60 border border-stone-800">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Atelier Extraction Hours</h4>
                  <p className="text-stone-300 text-xs mt-0.5">{footer.openingHours}</p>
                  <p className="text-stone-400 text-xs">{footer.weekendHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-stone-900/60 border border-stone-800">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Concierge & Enquiries</h4>
                  <p className="text-stone-300 text-xs mt-0.5">{footer.phone}</p>
                  <p className="text-stone-400 text-xs">{footer.email}</p>
                </div>
              </div>
            </div>

            {settings.booking.enabled && (
              <button
                onClick={() => {
                  playClickSound();
                  setIsBookingModalOpen(true);
                }}
                className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-black shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve a Table Today</span>
              </button>
            )}
          </div>

          {/* Right Stylized Map Showcase */}
          <div className="lg:col-span-7">
            <div 
              className="relative h-96 sm:h-[420px] rounded-3xl border overflow-hidden shadow-2xl p-2 group"
              style={{
                backgroundColor: `${settings.theme.cardBackground}c0`,
                borderColor: `${primaryColor}30`,
              }}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden relative">
                <img loading="lazy" decoding="async"
                  src="https://images.pexels.com/photos/11287941/pexels-photo-11287941.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                  alt="Atelier Location"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Dark luxury map overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 flex flex-col justify-between p-6">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-black/80 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                      GPS: 40.7128° N, 74.0060° W
                    </span>
                    <a
                      href={footer.mapsUrl || 'https://maps.google.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-black/80 text-amber-300 hover:text-white border border-amber-500/40 backdrop-blur-md transition-all hover:scale-110"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/80 border border-amber-900/60 backdrop-blur-xl max-w-sm">
                    <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      Complimentary Valet Parking Available
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Located in the heart of the velvet roastery district. Valet service begins 30 mins before opening.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
