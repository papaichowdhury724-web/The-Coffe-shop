'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Star, MessageSquare, Sparkles, Send } from 'lucide-react';

export default function ReviewsSection() {
  const { settings, reviews, addReview, playClickSound, showToast } = useCafe();
  const [showAddForm, setShowAddForm] = useState(false);
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('Coffee Aficionado');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const primaryColor = settings.theme.primaryColor;
  const approvedReviews = reviews.filter(r => r.isApproved);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (!author.trim() || !comment.trim()) {
      showToast('Please fill out your name and thoughts.');
      return;
    }
    addReview({
      author,
      role,
      rating,
      comment,
    });
    setAuthor('');
    setComment('');
    setShowAddForm(false);
  };

  return (
    <section id="reviews" className="relative py-28 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div 
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-[0.25em] uppercase mb-4 backdrop-blur-md border"
            style={{
              backgroundColor: `${settings.theme.cardBackground}90`,
              borderColor: `${primaryColor}40`,
              color: primaryColor,
            }}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Connoisseur Chronicles</span>
          </div>

          <h2 
            className="text-3xl sm:text-5xl font-serif font-light tracking-wide uppercase mb-4"
            style={{ color: settings.theme.textColor }}
          >
            Words of Reverence
          </h2>

          <p className="text-stone-300 text-sm sm:text-base font-light max-w-xl mx-auto">
            Reflections from specialty coffee judges, designers, and guests who have experienced our velvet extraction sanctuary.
          </p>

          <button
            onClick={() => {
              playClickSound();
              setShowAddForm(!showAddForm);
            }}
            className="mt-6 px-5 py-2 rounded-full text-xs font-semibold tracking-wider text-amber-300 border border-amber-500/40 hover:border-amber-400 bg-stone-900/80 transition-all flex items-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close Review Form' : 'Leave a Connoisseur Note'}</span>
          </button>
        </div>

        {/* Add Review Dropdown Form */}
        {showAddForm && (
          <form 
            onSubmit={handleSubmitReview}
            className="max-w-xl mx-auto mb-12 p-6 rounded-3xl border backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 space-y-4"
            style={{
              backgroundColor: `${settings.theme.cardBackground}fa`,
              borderColor: `${primaryColor}40`,
            }}
          >
            <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
              Share Your Atelier Experience
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your Name"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Title / Role (e.g. Coffee Lover)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setRating(star);
                    }}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400' : 'text-stone-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              required
              placeholder="Describe the aroma, extraction, atmosphere..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />

            <button
              type="submit"
              className="w-full py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-black shadow-md flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Chronicle</span>
            </button>
          </form>
        )}

        {/* Reviews Cards Carousel / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {approvedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 sm:p-8 rounded-3xl border backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] relative"
              style={{
                backgroundColor: `${settings.theme.cardBackground}c8`,
                borderColor: `${primaryColor}25`,
              }}
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed italic mb-6">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Author footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-stone-800">
                <div 
                  className="w-9 h-9 rounded-full border flex items-center justify-center text-xs font-serif font-bold text-amber-200 uppercase shrink-0"
                  style={{
                    borderColor: `${primaryColor}60`,
                    backgroundColor: `${settings.theme.backgroundColor}`,
                  }}
                >
                  {rev.author.slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">
                    {rev.author}
                  </h4>
                  <p className="text-[10px] text-stone-400 font-mono">
                    {rev.role || 'Guest'} • {rev.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
