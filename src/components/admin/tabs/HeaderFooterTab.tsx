'use client';

import React, { useRef } from 'react';
import { useCafe } from '@/context/CafeContext';
import { HeaderConfig, FooterConfig, LinkItem, SocialLink } from '@/lib/types';
import { initialCafeSettings } from '@/lib/default-data';
import { fileToCompressedDataUrl } from '@/lib/image';
import { TextField, Toggle, inputClass } from '@/components/admin/FormControls';
import {
  SlidersHorizontal, Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Upload, RotateCcw, PanelBottom,
} from 'lucide-react';

/** Anything with a label, a visible flag and one link field (`href` or `url`). */
type EditableLink = { id: string; label: string; visible: boolean };

interface LinkListEditorProps<T extends EditableLink> {
  title: string;
  hint?: string;
  items: T[];
  linkKey: 'href' | 'url';
  labelPlaceholder: string;
  linkPlaceholder: string;
  addLabel: string;
  onChange: (items: T[]) => void;
  makeNew: (label: string, link: string) => T;
}

function LinkListEditor<T extends EditableLink>({
  title, hint, items, linkKey, labelPlaceholder, linkPlaceholder, addLabel, onChange, makeNew,
}: LinkListEditorProps<T>) {
  const { playClickSound, settings } = useCafe();
  const primaryColor = settings.theme.primaryColor;
  const [newLabel, setNewLabel] = React.useState('');
  const [newLink, setNewLink] = React.useState('');

  // Always edit the latest list (a debounced field may commit after other edits).
  const latest = useRef(items);
  latest.current = items;
  const commit = (next: T[]) => {
    latest.current = next;
    onChange(next);
  };

  const patch = (id: string, partial: Partial<T>) =>
    commit(latest.current.map((l) => (l.id === id ? { ...l, ...partial } : l)));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= latest.current.length) return;
    playClickSound();
    const next = [...latest.current];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  const add = () => {
    if (!newLabel.trim()) return;
    playClickSound();
    commit([...latest.current, makeNew(newLabel.trim(), newLink.trim() || '#')]);
    setNewLabel('');
    setNewLink('');
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs uppercase font-semibold text-stone-300 block">{title}</label>
        {hint && <p className="text-[10px] text-stone-500 mt-0.5">{hint}</p>}
      </div>

      {items.length === 0 && (
        <p className="text-[11px] text-stone-500 italic">Nothing here yet - add one below.</p>
      )}

      <div className="space-y-2">
        {items.map((link, i) => (
          <div
            key={link.id}
            className={`p-2.5 rounded-xl border flex flex-wrap items-center gap-2 ${
              link.visible ? 'bg-black/40 border-stone-800/80' : 'bg-black/20 border-stone-800/40 opacity-70'
            }`}
          >
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-0.5 text-stone-500 hover:text-amber-300 disabled:opacity-20"
                title="Move up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="p-0.5 text-stone-500 hover:text-amber-300 disabled:opacity-20"
                title="Move down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <TextField
              className="flex-1 min-w-[120px]"
              value={link.label}
              placeholder="Label"
              onCommit={(v) => patch(link.id, { label: v } as Partial<T>)}
            />
            <TextField
              className="flex-[1.4] min-w-[150px]"
              value={String((link as unknown as Record<string, unknown>)[linkKey] ?? '')}
              placeholder={linkPlaceholder}
              onCommit={(v) => patch(link.id, { [linkKey]: v } as Partial<T>)}
            />

            <button
              type="button"
              onClick={() => {
                playClickSound();
                patch(link.id, { visible: !link.visible } as Partial<T>);
              }}
              className={`px-2.5 py-2 rounded-lg text-xs font-medium border flex items-center gap-1 ${
                link.visible
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
              title={link.visible ? 'Click to hide' : 'Click to show'}
            >
              {link.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{link.visible ? 'Visible' : 'Hidden'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                commit(latest.current.filter((l) => l.id !== link.id));
              }}
              className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-red-400"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <input
          type="text"
          placeholder={labelPlaceholder}
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          className={`${inputClass} flex-1 min-w-[140px]`}
        />
        <input
          type="text"
          placeholder={linkPlaceholder}
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          className={`${inputClass} flex-1 min-w-[140px]`}
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5"
          style={{ backgroundColor: primaryColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{addLabel}</span>
        </button>
      </div>
    </div>
  );
}

export default function HeaderFooterTab() {
  const { settings, updateSettings, showToast, playClickSound } = useCafe();
  const header = settings.header;
  const footer = settings.footer;
  const primaryColor = settings.theme.primaryColor;

  // Keep the newest header/footer in a ref so a delayed (debounced) edit never overwrites a newer one.
  const headerRef = useRef(header);
  const footerRef = useRef(footer);
  headerRef.current = header;
  footerRef.current = footer;
  const fileRef = useRef<HTMLInputElement>(null);

  const updateHeader = (partial: Partial<HeaderConfig>) => {
    const next = { ...headerRef.current, ...partial };
    headerRef.current = next;
    updateSettings({ header: next });
  };

  const updateFooter = (partial: Partial<FooterConfig>) => {
    const next = { ...footerRef.current, ...partial };
    footerRef.current = next;
    updateSettings({ footer: next });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    fileToCompressedDataUrl(file, 256, 0.8)
      .then((url) => {
        updateHeader({ logoType: 'image', logoUrl: url });
        showToast('Logo uploaded.');
      })
      .catch(() => showToast('Could not read that image.'));
  };

  const resetHeader = () => {
    if (!confirm('Reset the header to its default content?')) return;
    playClickSound();
    updateHeader({ ...initialCafeSettings.header, brandName: headerRef.current.brandName });
    showToast('Header reset (brand name kept).');
  };

  const resetFooter = () => {
    if (!confirm('Reset the footer to its default content?')) return;
    playClickSound();
    updateFooter({ ...initialCafeSettings.footer, brandName: footerRef.current.brandName });
    showToast('Footer reset (brand name kept).');
  };

  const card = 'p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-6';
  const h3 = 'text-base font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2';
  const sub = 'text-[11px] uppercase tracking-widest font-mono text-amber-400/90 pt-2 border-t border-stone-800';

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* ============ HEADER ============ */}
      <div className={card}>
        <div className="flex items-start justify-between gap-3">
          <h3 className={h3}>
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            Header - Branding & Navigation
          </h3>
          <button
            type="button"
            onClick={resetHeader}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-stone-400 hover:text-red-400 border border-stone-800 bg-stone-900/60"
          >
            <RotateCcw className="w-3 h-3" /> Reset header
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextField
            label="Brand name (shown everywhere)"
            value={header.brandName}
            onCommit={(v) => updateHeader({ brandName: v })}
            hint="Header, footer, loader and browser tab all use this name."
          />
          <TextField
            label="Tagline under logo"
            value={header.brandTagline}
            onCommit={(v) => updateHeader({ brandTagline: v })}
            hint="Leave empty to hide the tagline."
          />
          <TextField
            label="Header button text"
            value={header.ctaText}
            onCommit={(v) => updateHeader({ ctaText: v })}
          />
        </div>

        {/* Logo */}
        <div className="space-y-3">
          <p className={sub}>Logo</p>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="w-12 h-12 rounded-full border flex items-center justify-center overflow-hidden bg-black/50 text-amber-300 text-xs font-bold"
              style={{ borderColor: `${primaryColor}60` }}
            >
              {header.logoType === 'image' && header.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={header.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                'ICON'
              )}
            </div>

            {(['text', 'image'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { playClickSound(); updateHeader({ logoType: t }); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border ${
                  header.logoType === t
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                    : 'bg-black/40 border-stone-800 text-stone-400'
                }`}
              >
                {t === 'text' ? 'Coffee icon' : 'Custom image'}
              </button>
            ))}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-stone-700 bg-stone-900 text-stone-200 flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Upload logo
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
          {header.logoType === 'image' && (
            <TextField
              label="…or paste an image link"
              value={header.logoUrl?.startsWith('data:') ? '' : header.logoUrl || ''}
              placeholder="https://example.com/logo.png"
              onCommit={(v) => updateHeader({ logoUrl: v })}
            />
          )}
        </div>

        {/* Behaviour */}
        <div className="space-y-3">
          <p className={sub}>Appearance & buttons</p>
          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">Header style</label>
            <select
              value={header.headerStyle}
              onChange={(e) => updateHeader({ headerStyle: e.target.value as HeaderConfig['headerStyle'] })}
              className={inputClass}
            >
              <option value="floating-glass">Floating glass (clear on top, frosted when scrolling)</option>
              <option value="solid-dark">Solid dark (always filled)</option>
              <option value="transparent-minimal">Transparent minimal (never filled)</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Toggle
              label="Reservation button"
              description="Needs Table Booking to be enabled"
              checked={header.showBookingCta}
              onChange={(v) => updateHeader({ showBookingCta: v })}
            />
            <Toggle
              label="Ambience sound button"
              checked={header.showSoundToggle}
              onChange={(v) => updateHeader({ showSoundToggle: v })}
            />
          </div>
        </div>

        <LinkListEditor<LinkItem>
          title="Navigation menu links"
          hint="Use #section-id for page sections (e.g. #menu) or a full https:// link."
          items={header.navLinks}
          linkKey="href"
          labelPlaceholder="Label (e.g. Masterclass)"
          linkPlaceholder="Link (e.g. #story)"
          addLabel="Add link"
          onChange={(navLinks) => updateHeader({ navLinks })}
          makeNew={(label, href) => ({ id: `nav-${Date.now()}`, label, href, visible: true })}
        />
      </div>

      {/* ============ FOOTER ============ */}
      <div className={card}>
        <div className="flex items-start justify-between gap-3">
          <h3 className={h3}>
            <PanelBottom className="w-4 h-4 text-amber-400" />
            Footer - everything you see in the footer
          </h3>
          <button
            type="button"
            onClick={resetFooter}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-stone-400 hover:text-red-400 border border-stone-800 bg-stone-900/60"
          >
            <RotateCcw className="w-3 h-3" /> Reset footer
          </button>
        </div>

        <p className={sub}>Brand block</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Tagline under brand name"
            value={footer.tagline}
            onCommit={(v) => updateFooter({ tagline: v })}
          />
          <TextField
            label="Highlight quote (top of footer)"
            value={footer.quote}
            onCommit={(v) => updateFooter({ quote: v })}
            hint="Leave empty to hide."
          />
          <TextField
            className="sm:col-span-2"
            label="Description"
            multiline
            value={footer.description}
            onCommit={(v) => updateFooter({ description: v })}
          />
        </div>

        <LinkListEditor<SocialLink>
          title="Social media links"
          items={footer.socialLinks}
          linkKey="url"
          labelPlaceholder="Name (e.g. TikTok)"
          linkPlaceholder="https://…"
          addLabel="Add social"
          onChange={(socialLinks) => updateFooter({ socialLinks })}
          makeNew={(label, url) => ({ id: `soc-${Date.now()}`, label, url, visible: true })}
        />

        <p className={sub}>Hours & contact</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Column title"
            value={footer.hoursTitle}
            onCommit={(v) => updateFooter({ hoursTitle: v })}
          />
          <TextField
            label="Extra note"
            value={footer.hoursNote}
            onCommit={(v) => updateFooter({ hoursNote: v })}
            hint="e.g. Valet parking available. Leave empty to hide."
          />
          <TextField
            label="Weekday hours"
            value={footer.openingHours}
            onCommit={(v) => updateFooter({ openingHours: v })}
          />
          <TextField
            label="Weekend hours"
            value={footer.weekendHours}
            onCommit={(v) => updateFooter({ weekendHours: v })}
          />
          <TextField
            className="sm:col-span-2"
            label="Address"
            value={footer.address}
            onCommit={(v) => updateFooter({ address: v })}
          />
          <TextField
            label="Phone"
            value={footer.phone}
            onCommit={(v) => updateFooter({ phone: v })}
          />
          <TextField
            label="Email"
            type="email"
            value={footer.email}
            onCommit={(v) => updateFooter({ email: v })}
          />
          <TextField
            className="sm:col-span-2"
            label="Google Maps link (Location section button)"
            value={footer.mapsUrl}
            onCommit={(v) => updateFooter({ mapsUrl: v })}
          />
        </div>

        <p className={sub}>Quick links column</p>
        <TextField
          label="Column title"
          value={footer.quickLinksTitle}
          onCommit={(v) => updateFooter({ quickLinksTitle: v })}
          hint="Hide the whole column by hiding or deleting all its links."
        />
        <LinkListEditor<LinkItem>
          title="Links"
          items={footer.quickLinks}
          linkKey="href"
          labelPlaceholder="Label"
          linkPlaceholder="Link (e.g. #menu)"
          addLabel="Add link"
          onChange={(quickLinks) => updateFooter({ quickLinks })}
          makeNew={(label, href) => ({ id: `fl-${Date.now()}`, label, href, visible: true })}
        />

        <p className={sub}>Newsletter</p>
        <Toggle
          label="Show newsletter box"
          checked={footer.showNewsletter}
          onChange={(v) => updateFooter({ showNewsletter: v })}
        />
        {footer.showNewsletter && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Title"
              value={footer.newsletterTitle}
              onCommit={(v) => updateFooter({ newsletterTitle: v })}
            />
            <TextField
              label="Button text"
              value={footer.newsletterButtonText}
              onCommit={(v) => updateFooter({ newsletterButtonText: v })}
              hint="Leave empty for a plain send icon."
            />
            <TextField
              className="sm:col-span-2"
              label="Description"
              multiline
              rows={2}
              value={footer.newsletterDescription}
              onCommit={(v) => updateFooter({ newsletterDescription: v })}
            />
            <TextField
              className="sm:col-span-2"
              label="Email field placeholder"
              value={footer.newsletterPlaceholder}
              onCommit={(v) => updateFooter({ newsletterPlaceholder: v })}
            />
          </div>
        )}

        <p className={sub}>Bottom bar</p>
        <TextField
          label="Copyright notice"
          value={footer.copyrightText}
          onCommit={(v) => updateFooter({ copyrightText: v })}
        />
        <LinkListEditor<LinkItem>
          title="Bottom links (e.g. Privacy, Tasting Menu)"
          items={footer.bottomLinks}
          linkKey="href"
          labelPlaceholder="Label"
          linkPlaceholder="Link (e.g. #menu or https://…)"
          addLabel="Add link"
          onChange={(bottomLinks) => updateFooter({ bottomLinks })}
          makeNew={(label, href) => ({ id: `bl-${Date.now()}`, label, href, visible: true })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <Toggle
            label="Show admin link"
            description="Small link to /admin at the very bottom"
            checked={footer.showAdminLink}
            onChange={(v) => updateFooter({ showAdminLink: v })}
          />
          <TextField
            label="Admin link text"
            value={footer.adminLinkLabel}
            onCommit={(v) => updateFooter({ adminLinkLabel: v })}
          />
        </div>
      </div>
    </div>
  );
}
