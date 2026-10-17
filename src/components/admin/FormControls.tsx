'use client';

import React, { useEffect, useRef, useState } from 'react';

export const inputClass =
  'w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500';

interface FieldProps {
  label?: string;
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'url';
  multiline?: boolean;
  rows?: number;
  hint?: string;
  className?: string;
}

/**
 * Text input that keeps what you type in its own state and sends it to the (big) settings object
 * a moment later / on blur. Typing stays instant even when the settings contain large images,
 * and a pending edit is never lost if you switch tabs.
 */
export function TextField({
  label, value, onCommit, placeholder, type = 'text', multiline, rows = 3, hint, className = '',
}: FieldProps) {
  const [local, setLocal] = useState(value);
  const focused = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<string | null>(null);
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;

  // Follow outside changes (discard, reset, other tab) - but never while the user is typing.
  useEffect(() => {
    if (!focused.current && pending.current === null) setLocal(value);
  }, [value]);

  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (pending.current !== null) {
      const v = pending.current;
      pending.current = null;
      commitRef.current(v);
    }
  };

  // Commit anything still pending when the field disappears.
  useEffect(() => () => flush(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (v: string) => {
    setLocal(v);
    pending.current = v;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 250);
  };

  const common = {
    value: local,
    placeholder,
    onFocus: () => { focused.current = true; },
    onBlur: () => { focused.current = false; flush(); },
    className: inputClass,
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">{label}</label>
      )}
      {multiline ? (
        <textarea rows={rows} {...common} onChange={(e) => handleChange(e.target.value)} />
      ) : (
        <input type={type} {...common} onChange={(e) => handleChange(e.target.value)} />
      )}
      {hint && <p className="text-[10px] text-stone-500 mt-1">{hint}</p>}
    </div>
  );
}

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full p-3 rounded-xl border flex items-center justify-between gap-3 text-left transition-colors ${
        checked ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-black/40 border-stone-800'
      }`}
    >
      <span>
        <span className="block text-xs font-semibold text-white">{label}</span>
        {description && <span className="block text-[10px] text-stone-500 mt-0.5">{description}</span>}
      </span>
      <span
        className={`shrink-0 w-9 h-5 rounded-full relative transition-colors ${checked ? 'bg-emerald-500' : 'bg-stone-700'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}
