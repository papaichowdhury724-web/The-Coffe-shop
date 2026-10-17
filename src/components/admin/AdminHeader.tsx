'use client';

import React from 'react';
import Link from 'next/link';
import { useCafe } from '@/context/CafeContext';
import { 
  Coffee, 
  ExternalLink, 
  RotateCcw, 
  Sparkles, 
  Database, 
  Check, 
  Save,
  Undo2,
  LogOut,
  Sliders 
} from 'lucide-react';

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminHeader({ activeTab, setActiveTab }: AdminHeaderProps) {
  const { settings, resetSettings, playClickSound, hasUnsavedChanges, saveChanges, discardChanges, adminEmail, logoutAdmin, isSaving } = useCafe();
  const primaryColor = settings.theme.primaryColor;

  return (
    <header 
      className="border-b sticky top-0 z-30 backdrop-blur-md"
      style={{
        backgroundColor: `${settings.theme.backgroundColor}fa`,
        borderColor: `${primaryColor}30`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg"
            style={{
              borderColor: `${primaryColor}60`,
              backgroundColor: `${settings.theme.cardBackground}`,
            }}
          >
            <Sliders className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-serif font-bold text-white tracking-wider">
                {settings.siteName} ADMIN
              </h1>
              <span 
                className="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold"
                style={{
                  backgroundColor: `${primaryColor}25`,
                  color: primaryColor,
                  border: `1px solid ${primaryColor}50`,
                }}
              >
                LIVE CONTROL
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-mono">
              Live Firebase Database
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {hasUnsavedChanges && (
            <span className="hidden md:inline text-[11px] font-mono text-amber-300 animate-pulse">
              ● Unsaved changes
            </span>
          )}

          {hasUnsavedChanges && (
            <button
              onClick={() => {
                playClickSound();
                discardChanges();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-stone-300 border border-stone-700 bg-stone-900/70 hover:text-white transition-colors"
              title="Throw away un-saved changes"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Discard</span>
            </button>
          )}

          <button
            onClick={() => {
              playClickSound();
              saveChanges();
            }}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-black shadow-lg transition-all enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving…' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all atelier settings to luxury default?')) {
                playClickSound();
                resetSettings();
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-400 hover:text-red-400 border border-stone-800 bg-stone-900/60 transition-colors"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={async () => {
              if (hasUnsavedChanges && !confirm('You have un-saved changes. Log out without saving?')) return;
              playClickSound();
              await logoutAdmin();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-stone-300 border border-stone-700 bg-stone-900/70 hover:text-white transition-colors"
            title={adminEmail ? `Logged in as ${adminEmail}` : 'Log out'}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          <Link
            href="/"
            onClick={(e) => {
              if (hasUnsavedChanges && !confirm('You have un-saved changes. Leave without saving?')) {
                e.preventDefault();
                return;
              }
              playClickSound();
            }}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-stone-200 border border-stone-700 bg-stone-900/70 transition-transform hover:scale-105 active:scale-95"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
