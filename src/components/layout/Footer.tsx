'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCafe } from '@/context/CafeContext';
import {
  Coffee,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Sliders,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

/**
 * Every piece of text / link in this footer comes from `settings.footer`,
 * so everything you see here can be edited in Admin -> Header & Footer.
 */
export default function Footer() {
  const { settings, brandName, playClickSound, showToast } = useCafe();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const footer = settings.footer;
  const header = settings.header;
  const primaryColor = settings.theme.primaryColor;

  const useLogoImage = header.logoType === 'image' && !!header.logoUrl;
  const socials = (footer.socialLinks || []).filter((l) => l.visible && l.label.trim());
  const quickLinks = (footer.quickLinks || []).filter((l) => l.visible);
  const bottomLinks = (footer.bottomLinks || []).filter((l) => l.visible);

  const hasContact = !!(footer.address || footer.phone || footer.email);
  const hasHours = !!(footer.openingHours || footer.weekendHours || footer.hoursNote);
  const showContactColumn = hasContact || hasHours;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (!newsletterEmail.trim()) return;
    showToast(`Welcome to ${footer.newsletterTitle || 'our private circle'}.`);
    setNewsletterEmail('');
  };

  const isExternal = (href: string) => /^https?:\/\//i.test(href);

  // Column layout adapts to which columns are switched on, so there are never empty gaps.
  const columns = 1 + (quickLinks.length ? 1 : 0) + (showContactColumn ? 1 : 0) + (footer.showNewsletter ? 1 : 0);
  const gridCols =
    columns >= 4 ? 'lg:grid-cols-12' : columns === 3 ? 'lg:grid-cols-3' : columns === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-1';
  // Full class names on purpose: Tailwind can't see classes that are built with string templates.
  const SPAN: Record<number, string> = { 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4' };
  const span = (n: number) => (columns >= 4 ? SPAN[n] : '');

  return (
    <footer
      className="relative z-10 border-t pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden backdrop-blur-xl"
      style={{
        backgroundColor: `${settings.theme.backgroundColor}f8`,
        borderColor: `${primaryColor}25`,
      }}
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Top Highlight Quote */}
        {footer.quote && (
          <div className="text-center max-w-2xl mx-auto py-6 border-y border-stone-800/60">
            <p className="text-sm sm:text-base font-serif italic text-amber-200/90 tracking-wide">
              {footer.quote}
            </p>
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-10`}>
          {/* Brand Info */}
          <div className={`${span(4)} space-y-4`}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center border overflow-hidden"
                style={{
                  borderColor: `${primaryColor}60`,
                  backgroundColor: `${settings.theme.cardBackground}80`,
                }}
              >
                {useLogoImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={header.logoUrl} alt={brandName} className="w-full h-full object-cover" />
                ) : (
                  <Coffee className="w-5 h-5 text-amber-300" />
                )}
              </div>
              <h2 className="text-lg font-serif font-bold tracking-[0.2em] text-white break-words min-w-0">
                {brandName}
              </h2>
            </div>

            {footer.tagline && (
              <p className="text-[11px] uppercase tracking-[0.18em] text-amber-400/80">{footer.tagline}</p>
            )}

            {footer.description && (
              <p className="text-xs text-stone-400 font-light leading-relaxed">{footer.description}</p>
            )}

            {/* Social Links */}
            {socials.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {socials.map((link) => (
                  <a
                    key={link.id}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    onClick={playClickSound}
                    className="px-3.5 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-xs text-stone-300 hover:text-amber-400 hover:border-amber-400 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Navigation */}
          {quickLinks.length > 0 && (
            <div className={`${span(2)} space-y-3`}>
              {footer.quickLinksTitle && (
                <h4 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  {footer.quickLinksTitle}
                </h4>
              )}
              <ul className="space-y-2 text-xs text-stone-400">
                {quickLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      onClick={playClickSound}
                      {...(isExternal(link.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
                      className="hover:text-amber-300 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hours & Contact */}
          {showContactColumn && (
            <div className={`${span(3)} space-y-3`}>
              {footer.hoursTitle && (
                <h4 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  {footer.hoursTitle}
                </h4>
              )}
              <ul className="text-xs text-stone-400 space-y-3">
                {(footer.openingHours || footer.weekendHours) && (
                  <li className="flex items-start gap-2.5">
                    <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400/80" />
                    <span>
                      {footer.openingHours && <span className="block text-stone-300 font-medium">{footer.openingHours}</span>}
                      {footer.weekendHours && <span className="block">{footer.weekendHours}</span>}
                    </span>
                  </li>
                )}
                {footer.address && (
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400/80" />
                    <span>{footer.address}</span>
                  </li>
                )}
                {footer.phone && (
                  <li className="flex items-start gap-2.5">
                    <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400/80" />
                    <a href={`tel:${footer.phone.replace(/[^\d+]/g, '')}`} className="hover:text-amber-300 transition-colors">
                      {footer.phone}
                    </a>
                  </li>
                )}
                {footer.email && (
                  <li className="flex items-start gap-2.5">
                    <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400/80" />
                    <a href={`mailto:${footer.email}`} className="hover:text-amber-300 transition-colors break-all">
                      {footer.email}
                    </a>
                  </li>
                )}
                {footer.hoursNote && (
                  <li className="pt-1 text-[11px] text-amber-300/80">{footer.hoursNote}</li>
                )}
              </ul>
            </div>
          )}

          {/* Newsletter Subscribe */}
          {footer.showNewsletter && (
            <div className={`${span(3)} space-y-3`}>
              {footer.newsletterTitle && (
                <h4 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {footer.newsletterTitle}
                </h4>
              )}
              {footer.newsletterDescription && (
                <p className="text-xs text-stone-400">{footer.newsletterDescription}</p>
              )}
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder={footer.newsletterPlaceholder || 'Enter email address'}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full min-w-0 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl text-black text-xs font-bold shrink-0 shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
                  style={{ backgroundColor: primaryColor }}
                  title={footer.newsletterButtonText || 'Subscribe'}
                >
                  {footer.newsletterButtonText ? (
                    <>
                      <span className="uppercase tracking-wider">{footer.newsletterButtonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p className="text-center md:text-left">{footer.copyrightText}</p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {bottomLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={playClickSound}
                {...(isExternal(link.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="hover:text-amber-300 transition-colors"
              >
                {link.label}
              </a>
            ))}

            {footer.showAdminLink && (
              <Link
                href="/admin"
                onClick={playClickSound}
                className="inline-flex items-center gap-1 text-[10px] font-mono tracking-wider text-stone-600 hover:text-amber-400/80 transition-colors"
              >
                <Sliders className="w-2.5 h-2.5" />
                <span>{footer.adminLinkLabel || 'Admin'}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
