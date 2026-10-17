'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCafe } from '@/context/CafeContext';
import { 
  Calendar, 
  Menu as MenuIcon, 
  X, 
  Volume2, 
  VolumeX, 
  Coffee 
} from 'lucide-react';

export default function Header() {
  const { 
    settings, 
    brandName,
    setIsBookingModalOpen, 
    playClickSound, 
    isPlayingSoundscape, 
    toggleSoundscape 
  } = useCafe();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let raf = 0;
    let tickerH = 0;
    const readTickerH = () => {
      tickerH = parseFloat(document.documentElement.style.getPropertyValue('--ticker-h')) || 0;
    };
    // Sit just below the top announcement bar, and slide up to 0 as it scrolls away.
    const place = () => {
      raf = 0;
      const el = headerRef.current;
      if (el) {
        el.style.top = `${Math.max(0, tickerH - window.scrollY)}px`;
      }
      // setState bails out when the value is unchanged, so this is cheap.
      setIsScrolled(window.scrollY > 40);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };
    const onTickerResize = () => {
      readTickerH();
      onScroll();
    };
    readTickerH();
    place();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('ticker-resize', onTickerResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('ticker-resize', onTickerResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Close the mobile menu if the viewport grows to desktop size
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (mq.matches) setMobileMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const primaryColor = settings.theme.primaryColor;
  const hdr = settings.header;
  const styleMode = hdr.headerStyle || 'floating-glass';
  // floating-glass: transparent until you scroll | solid-dark: always solid | transparent-minimal: never solid
  const isSolid = styleMode === 'solid-dark' || (styleMode === 'floating-glass' && isScrolled);
  const showGradient = !isSolid && styleMode !== 'transparent-minimal';
  const useLogoImage = hdr.logoType === 'image' && !!hdr.logoUrl;

  return (
    <header
      ref={headerRef}
      // NOTE: never use `transition-all` here. `top` is updated on every scroll frame to sit
      // under the announcement bar; animating it made the header lag and overlap the ticker.
      className={`fixed inset-x-0 z-40 transition-[padding,background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
        isSolid ? 'py-3 backdrop-blur-xl border-b shadow-2xl' : 'py-5'
      } ${showGradient ? 'bg-gradient-to-b from-black/80 to-transparent' : ''}`}
      style={{
        top: 'var(--ticker-h, 0px)',
        backgroundColor: isSolid ? `${settings.theme.backgroundColor}d9` : 'transparent',
        borderColor: isSolid ? `${primaryColor}20` : 'transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a 
          href="#" 
          onClick={playClickSound}
          className="flex items-center gap-3 group"
        >
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center border overflow-hidden transition-transform duration-300 group-hover:rotate-12"
            style={{
              borderColor: `${primaryColor}60`,
              backgroundColor: `${settings.theme.cardBackground}80`,
              boxShadow: `0 0 15px ${primaryColor}25`,
            }}
          >
            {useLogoImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hdr.logoUrl} alt={brandName} className="w-full h-full object-cover rounded-full" />
            ) : (
              <Coffee className="w-5 h-5 text-amber-300" />
            )}
          </div>
          <div>
            <h1 
              className="text-lg sm:text-xl font-serif font-bold tracking-[0.25em]"
              style={{ color: settings.theme.textColor }}
            >
              {brandName}
            </h1>
            {hdr.brandTagline && (
              <p className="text-[9px] uppercase tracking-[0.3em] text-amber-400/80 -mt-0.5">
                {hdr.brandTagline}
              </p>
            )}
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {settings.header.navLinks
            .filter(link => link.visible)
            .map(link => (
              <a
                key={link.id}
                href={link.href}
                onClick={playClickSound}
                className="text-xs uppercase tracking-[0.2em] font-medium text-stone-300 hover:text-amber-300 transition-colors relative group py-1"
              >
                {link.label}
                <span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: primaryColor }}
                />
              </a>
            ))}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Soundscape Quick Toggle */}
          {settings.header.showSoundToggle && (
            <button
              onClick={() => {
                playClickSound();
                toggleSoundscape();
              }}
              className="p-2 rounded-full border transition-all text-stone-300 hover:text-amber-300 hidden sm:flex items-center justify-center"
              style={{
                borderColor: `${primaryColor}30`,
                backgroundColor: `${settings.theme.cardBackground}60`,
              }}
              title={isPlayingSoundscape ? 'Mute Ambience' : 'Play Ambience'}
            >
              {isPlayingSoundscape ? (
                <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Table Booking Reservation Button (Visible ONLY if Table Booking is enabled!) */}
          {settings.booking.enabled && settings.header.showBookingCta && (
            <button
              onClick={() => {
                playClickSound();
                setIsBookingModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 border"
              style={{
                backgroundColor: primaryColor,
                color: '#0A0807',
                borderColor: primaryColor,
                boxShadow: `0 0 20px ${primaryColor}40`,
              }}
            >
              <Calendar className="w-3.5 h-3.5 text-black" />
              <span>{settings.header.ctaText || 'Reserve Table'}</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => {
              playClickSound();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="p-2 rounded-lg border text-stone-300 hover:text-amber-300 lg:hidden"
            style={{
              borderColor: `${primaryColor}30`,
              backgroundColor: `${settings.theme.cardBackground}80`,
            }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden border-b px-6 py-6 space-y-4 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300 max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain"
          style={{
            backgroundColor: `${settings.theme.backgroundColor}fb`,
            borderColor: `${primaryColor}30`,
          }}
        >
          <div className="flex flex-col space-y-3">
            {settings.header.navLinks
              .filter(link => link.visible)
              .map(link => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => {
                    playClickSound();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm font-medium tracking-widest uppercase text-stone-200 hover:text-amber-400 py-2 border-b border-stone-800/60"
                >
                  {link.label}
                </a>
              ))}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            {settings.booking.enabled && settings.header.showBookingCta && (
              <button
                onClick={() => {
                  playClickSound();
                  setMobileMenuOpen(false);
                  setIsBookingModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-black shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <Calendar className="w-4 h-4" />
                <span>{settings.header.ctaText || 'Reserve Table'}</span>
              </button>
            )}

          </div>
        </div>
      )}
    </header>
  );
}
