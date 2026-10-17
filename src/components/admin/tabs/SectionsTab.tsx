'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { fileToCompressedDataUrl } from '@/lib/image';
import { SectionConfig } from '@/lib/types';
import { 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Edit2, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Upload, 
  Check, 
  Sparkles 
} from 'lucide-react';

export default function SectionsTab() {
  const { settings, updateSettings, showToast, playClickSound } = useCafe();
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editMediaUrl, setEditMediaUrl] = useState('');

  // Add new section state
  const [newSectionName, setNewSectionName] = useState('');

  const primaryColor = settings.theme.primaryColor;
  const sections = [...settings.sections].sort((a, b) => a.order - b.order);

  const handleToggle = (id: string) => {
    playClickSound();
    const updated = settings.sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    updateSettings({ sections: updated });
    showToast('Section visibility updated.');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    playClickSound();
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    // Swap order
    const tempOrder = newSections[index].order;
    newSections[index].order = newSections[targetIndex].order;
    newSections[targetIndex].order = tempOrder;

    updateSettings({ sections: newSections });
    showToast('Section order re-arranged.');
  };

  const startEdit = (s: SectionConfig) => {
    playClickSound();
    setEditingSectionId(s.id);
    setEditTitle(s.title || '');
    setEditSubtitle(s.subtitle || '');
    setEditMediaUrl(s.mediaUrl || '');
  };

  const saveEdit = (id: string) => {
    playClickSound();
    const updated = settings.sections.map(s => s.id === id ? {
      ...s,
      title: editTitle,
      subtitle: editSubtitle,
      mediaUrl: editMediaUrl,
    } : s);
    updateSettings({ sections: updated });
    setEditingSectionId(null);
    showToast('Section details saved.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    fileToCompressedDataUrl(file)
      .then((dataUrl) => {
        setEditMediaUrl(dataUrl);
        showToast('Image file loaded successfully!');
      })
      .catch(() => showToast('Could not read that image file.'));
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    playClickSound();
    const id = `sec-${Date.now()}`;
    const newSec: SectionConfig = {
      id,
      name: newSectionName,
      enabled: true,
      order: sections.length + 1,
      title: newSectionName,
      subtitle: 'Custom cinematic experience block',
    };
    updateSettings({ sections: [...settings.sections, newSec] });
    setNewSectionName('');
    showToast(`Created section "${newSectionName}".`);
  };

  const handleDeleteSection = (id: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      playClickSound();
      const updated = settings.sections.filter(s => s.id !== id);
      updateSettings({ sections: updated });
      showToast('Section removed.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-stone-900/60 border border-stone-800">
        <div>
          <h3 className="text-base font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Website Sections & Sequence Manager
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Re-order, toggle ON/OFF, and customize background videos or imagery for any chapter of the website.
          </p>
        </div>

        {/* Add section input */}
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="New Section Name..."
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500 w-full sm:w-48"
          />
          <button
            onClick={handleAddSection}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5 shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((s, idx) => {
          const isEditing = editingSectionId === s.id;
          return (
            <div
              key={s.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                s.enabled ? 'bg-stone-900/70 border-stone-800' : 'bg-stone-950/40 border-stone-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                {/* Drag / Order & Name */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 rounded bg-stone-800 text-stone-400 hover:text-white disabled:opacity-20"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      disabled={idx === sections.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 rounded bg-stone-800 text-stone-400 hover:text-white disabled:opacity-20"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-mono text-xs font-bold text-amber-400 w-5">
                    #{idx + 1}
                  </span>

                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{s.name}</span>
                      <span className="text-[10px] font-mono text-stone-500 uppercase">({s.id})</span>
                    </h4>
                    {s.title && <p className="text-xs text-stone-400 mt-0.5">&ldquo;{s.title}&rdquo;</p>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => handleToggle(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                      s.enabled 
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                        : 'bg-stone-800 border-stone-700 text-stone-400'
                    }`}
                  >
                    {s.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{s.enabled ? 'Active' : 'Hidden'}</span>
                  </button>

                  <button
                    onClick={() => startEdit(s)}
                    className="p-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-400 transition-colors"
                    title="Edit Section Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteSection(s.id)}
                    className="p-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-400 hover:text-red-400 transition-colors"
                    title="Remove Section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* In-place edit Drawer */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-stone-800/80 space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                        Section Headline Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                        Subtitle / Catchphrase
                      </label>
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Media (URL or Upload File) */}
                  <div>
                    <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                      Background Media (Video / Image URL or Upload File)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="https://images.pexels.com/... or https://...video.mp4"
                        value={editMediaUrl}
                        onChange={(e) => setEditMediaUrl(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <label className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-300 border border-amber-500/40 bg-stone-900 hover:bg-stone-800 cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>

                    {editMediaUrl && (
                      <div className="mt-2 h-24 w-40 rounded-xl overflow-hidden border border-stone-800 relative">
                        <img src={editMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingSectionId(null)}
                      className="px-4 py-1.5 rounded-xl text-xs font-medium text-stone-400 bg-stone-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(s.id)}
                      className="px-5 py-1.5 rounded-xl text-xs font-bold text-black flex items-center gap-1.5 shadow-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
