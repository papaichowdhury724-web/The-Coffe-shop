'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { fileToCompressedDataUrl } from '@/lib/image';
import { MenuItem } from '@/lib/types';
import { 
  Coffee, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Upload, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Sparkles 
} from 'lucide-react';

export default function MenuTab() {
  const { settings, menuItems, addMenuItem, updateMenuItem, deleteMenuItem, showToast, playClickSound } = useCafe();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form fields state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Espresso & Signatures');
  const [price, setPrice] = useState(6.50);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('https://images.pexels.com/photos/13240964/pexels-photo-13240964.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200');
  const [origin, setOrigin] = useState('Panama Boquete');
  const [roastLevel, setRoastLevel] = useState<'Light' | 'Medium' | 'Medium-Dark' | 'Dark Espresso'>('Medium');
  const [flavorNotesStr, setFlavorNotesStr] = useState('Dark Cacao, Black Cherry, Jasmine');
  const [calories, setCalories] = useState(10);
  const [badge, setBadge] = useState('Signature');
  const [isAvailable, setIsAvailable] = useState(true);

  const primaryColor = settings.theme.primaryColor;

  const handleStartAdd = () => {
    playClickSound();
    setIsAddingNew(true);
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice(6.50);
    setFlavorNotesStr('Dark Cacao, Caramel, Jasmine');
  };

  const handleStartEdit = (item: MenuItem) => {
    playClickSound();
    setEditingItem(item);
    setIsAddingNew(false);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setDescription(item.description);
    setImage(item.image);
    setOrigin(item.origin || '');
    setRoastLevel(item.roastLevel || 'Medium');
    setFlavorNotesStr(item.flavorNotes?.join(', ') || '');
    setCalories(item.calories || 0);
    setBadge(item.badge || '');
    setIsAvailable(item.isAvailable);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (!name.trim()) return;
    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      showToast('Please enter a valid price.');
      return;
    }

    const flavorNotes = flavorNotesStr.split(',').map(s => s.trim()).filter(Boolean);

    if (isAddingNew) {
      addMenuItem({
        name,
        category,
        price: Number(price),
        description,
        image,
        origin,
        roastLevel,
        flavorNotes,
        calories: Number.isFinite(Number(calories)) ? Number(calories) : 0,
        badge: badge || undefined,
        isAvailable,
        isFeatured: true,
      });
      setIsAddingNew(false);
    } else if (editingItem) {
      updateMenuItem(editingItem.id, {
        name,
        category,
        price: Number(price),
        description,
        image,
        origin,
        roastLevel,
        flavorNotes,
        calories: Number.isFinite(Number(calories)) ? Number(calories) : 0,
        badge: badge || undefined,
        isAvailable,
      });
      setEditingItem(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    fileToCompressedDataUrl(file)
      .then((dataUrl) => {
        setImage(dataUrl);
        showToast('Photo loaded into menu card!');
      })
      .catch(() => showToast('Could not read that image file.'));
  };

  const filtered = menuItems.filter(item => {
    const matchesCat = selectedCat === 'All' || item.category === selectedCat;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-stone-900/60 border border-stone-800">
        <div>
          <h3 className="text-base font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-400" />
            Atelier Menu & Offerings Manager
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Add rare beans, manual brews, artisan pastries, and signatures. Control pricing, roast notes, and availability.
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-transform"
          style={{ backgroundColor: primaryColor }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Brew</span>
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {(isAddingNew || editingItem) && (
        <form 
          onSubmit={handleSave}
          className="p-6 sm:p-8 rounded-3xl border bg-stone-900/90 border-amber-500/40 shadow-2xl space-y-6 animate-in zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
              {isAddingNew ? 'Create New Atelier Menu Offering' : `Edit: ${editingItem?.name}`}
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsAddingNew(false);
                setEditingItem(null);
              }}
              className="p-1 rounded-full text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                Coffee / Item Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kyoto 18-Hour Slow Cold Drip"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Espresso & Signatures">Espresso & Signatures</option>
                <option value="Manual Pour-Over">Manual Pour-Over</option>
                <option value="Cold Brews & Nitro">Cold Brews & Nitro</option>
                <option value="Artisanal Pastries">Artisanal Pastries</option>
                <option value="Master Beans & Merch">Master Beans & Merch</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                Price ({settings.currency}) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={Number.isNaN(price) ? '' : price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                Bean Origin / Terroir
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Panama Boquete (1,800m)"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                Roast Profile
              </label>
              <select
                value={roastLevel}
                onChange={(e) => setRoastLevel(e.target.value as typeof roastLevel)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Light">Light (Floral & Bright)</option>
                <option value="Medium">Medium (Balanced Sweetness)</option>
                <option value="Medium-Dark">Medium-Dark (Caramel & Body)</option>
                <option value="Dark Espresso">Dark Espresso (Deep Cacao)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
                Badge Pill (e.g. Signature, Limited)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Signature, Award Winner"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Sensory Flavor Notes (Comma separated)
            </label>
            <input
              type="text"
              value={flavorNotesStr}
              onChange={(e) => setFlavorNotesStr(e.target.value)}
              placeholder="e.g. Dark Cacao, Bergamot, Honey, Jasmine"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Description
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sensory tasting experience..."
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Image URL or Choose File */}
          <div>
            <label className="text-[11px] uppercase font-semibold text-stone-400 block mb-1">
              Image URL or Upload Photo
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <label className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-300 border border-amber-500/40 bg-stone-900 hover:bg-stone-800 cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {image && (
              <div className="mt-2 h-20 w-28 rounded-xl overflow-hidden border border-stone-800">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500"
              />
              <span>Available for Order in Atelier</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                Save Item
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          {['All', 'Espresso & Signatures', 'Manual Pour-Over', 'Cold Brews & Nitro', 'Artisanal Pastries', 'Master Beans & Merch'].map(c => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                selectedCat === c ? 'bg-amber-500/20 text-amber-300 border-amber-500' : 'bg-stone-900 border-stone-800 text-stone-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-full text-xs bg-stone-900 border border-stone-800 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Menu Items Table / Grid */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">{item.name}</h4>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 truncate max-w-sm mt-0.5">
                  {item.category} • {settings.currency}{Number(item.price).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => updateMenuItem(item.id, { isAvailable: !item.isAvailable })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${
                  item.isAvailable ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-red-500/15 border-red-500/40 text-red-300'
                }`}
              >
                {item.isAvailable ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{item.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
              </button>

              <button
                onClick={() => handleStartEdit(item)}
                className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-amber-400"
                title="Edit item"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete ${item.name}?`)) {
                    deleteMenuItem(item.id);
                  }
                }}
                className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-red-400"
                title="Delete item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
