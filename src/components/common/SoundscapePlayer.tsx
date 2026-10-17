'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Music, Sparkles, Disc } from 'lucide-react';
import { useCafe } from '@/context/CafeContext';

export default function SoundscapePlayer() {
  const { 
    settings, 
    isPlayingSoundscape, 
    toggleSoundscape, 
    soundscapeVibe, 
    setSoundscapeVibe, 
    soundVolume, 
    setSoundVolume 
  } = useCafe();

  const [isOpen, setIsOpen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const stopGraphRef = useRef<(() => void) | null>(null);
  const volumeRef = useRef(soundVolume);

  useEffect(() => {
    volumeRef.current = soundVolume;
  }, [soundVolume]);

  // Tear down the current audio graph completely (oscillators, LFOs, noise).
  const teardown = useCallback(() => {
    if (stopGraphRef.current) {
      stopGraphRef.current();
      stopGraphRef.current = null;
    }
    gainNodeRef.current = null;
  }, []);

  const startProceduralAmbience = useCallback(() => {
    try {
      // Never stack a second graph on top of a running one.
      teardown();

      if (!audioContextRef.current) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new Ctor();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      // Master gain (fades in to avoid a click)
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.setTargetAtTime(volumeRef.current * 0.25, ctx.currentTime, 0.15);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const sources: Array<AudioScheduledSourceNode> = [];
      const connected: AudioNode[] = [masterGain];

      // 1. Vinyl crackle / hiss
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = Math.random() < 0.003 ? (Math.random() - 0.5) * 0.9 : white * 0.03;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const vinylFilter = ctx.createBiquadFilter();
      vinylFilter.type = 'bandpass';
      vinylFilter.frequency.value = soundscapeVibe === 'rain' ? 1200 : 850;
      vinylFilter.Q.value = 1.2;

      const vinylGain = ctx.createGain();
      vinylGain.gain.value = 0.15;

      whiteNoise.connect(vinylFilter);
      vinylFilter.connect(vinylGain);
      vinylGain.connect(masterGain);
      whiteNoise.start();
      sources.push(whiteNoise);
      connected.push(vinylFilter, vinylGain);

      // 2. Warm harmonic drone / café chord resonance
      const chordFrequencies =
        soundscapeVibe === 'jazz'
          ? [130.81, 164.81, 196.0, 246.94] // Cmaj7 warmth
          : soundscapeVibe === 'rain'
            ? [110.0, 146.83, 164.81, 220.0]
            : [98.0, 146.83, 196.0, 293.66];

      chordFrequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Subtle LFO drift on the gain
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.15 + idx * 0.05;
        lfoGain.gain.value = 0.04;
        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);
        lfo.start();

        oscGain.gain.value = 0.08 / (idx + 1);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();

        sources.push(osc, lfo);
        connected.push(oscGain, lfoGain);
      });

      stopGraphRef.current = () => {
        const now = ctx.currentTime;
        try {
          masterGain.gain.cancelScheduledValues(now);
          masterGain.gain.setTargetAtTime(0, now, 0.08);
        } catch {
          /* ignore */
        }
        // Stop & disconnect after the short fade so nothing keeps running (battery!)
        setTimeout(() => {
          sources.forEach((n) => {
            try {
              n.stop();
            } catch {
              /* already stopped */
            }
          });
          connected.forEach((n) => {
            try {
              n.disconnect();
            } catch {
              /* ignore */
            }
          });
        }, 400);
      };
    } catch (e) {
      console.warn('Audio ambience initiation failed or user has not interacted yet:', e);
    }
  }, [soundscapeVibe, teardown]);

  // Start / stop / switch vibe. Volume is intentionally NOT a dependency —
  // moving the slider used to spawn a brand-new set of oscillators each time.
  useEffect(() => {
    if (isPlayingSoundscape) {
      startProceduralAmbience();
    } else {
      teardown();
    }
    return () => {
      teardown();
    };
  }, [isPlayingSoundscape, startProceduralAmbience, teardown]);

  // Live volume changes
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        isPlayingSoundscape ? soundVolume * 0.25 : 0,
        audioContextRef.current.currentTime,
        0.05
      );
    }
  }, [soundVolume, isPlayingSoundscape]);

  // Release the AudioContext when the player unmounts
  useEffect(() => {
    return () => {
      const ctx = audioContextRef.current;
      audioContextRef.current = null;
      if (ctx && ctx.state !== 'closed') {
        setTimeout(() => {
          void ctx.close().catch(() => undefined);
        }, 500);
      }
    };
  }, []);

  if (!settings.header.showSoundToggle && !settings.animation.enableSoundscape) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Soundscape Control Popup Modal / Pill */}
      {isOpen && (
        <div 
          className="mb-3 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border w-72 animate-in fade-in slide-in-from-bottom-3 duration-300"
          style={{
            backgroundColor: `${settings.theme.cardBackground}f0`,
            borderColor: `${settings.theme.primaryColor}30`,
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-amber-900/30">
            <div className="flex items-center gap-2">
              <Disc className={`w-4 h-4 text-amber-400 ${isPlayingSoundscape ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-200">
                Atelier Soundscape
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-200 text-xs px-2 py-0.5 rounded-full bg-stone-800/60"
            >
              ✕
            </button>
          </div>

          {/* Vibe Selection */}
          <div className="my-3 space-y-1.5">
            <p className="text-[11px] text-stone-400 font-medium">Select Atmosphere:</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'jazz', label: 'Noir Jazz', icon: '🎷' },
                { id: 'rain', label: 'Rainy Cafe', icon: '🌧️' },
                { id: 'roastery', label: 'Roastery', icon: '☕' },
              ].map(vibe => (
                <button
                  key={vibe.id}
                  onClick={() => {
                    setSoundscapeVibe(vibe.id as 'jazz' | 'rain' | 'roastery');
                    if (!isPlayingSoundscape) toggleSoundscape();
                  }}
                  className={`text-[11px] py-1.5 px-2 rounded-lg font-medium transition-all text-center flex flex-col items-center gap-0.5 ${
                    soundscapeVibe === vibe.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-inner'
                      : 'bg-stone-900/70 text-stone-400 border border-stone-800 hover:border-amber-900/50'
                  }`}
                >
                  <span className="text-sm">{vibe.icon}</span>
                  <span>{vibe.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1 mt-3">
            <div className="flex justify-between text-[11px] text-stone-400">
              <span>Volume</span>
              <span className="text-amber-400">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          <div className="mt-3 pt-2 text-[10px] text-stone-500 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400/70" />
            <span>Procedural spatial cafe audio active</span>
          </div>
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-xl backdrop-blur-md border transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: isPlayingSoundscape ? `${settings.theme.cardBackground}ea` : `${settings.theme.cardBackground}b0`,
            borderColor: isPlayingSoundscape ? `${settings.theme.primaryColor}80` : `${settings.theme.primaryColor}30`,
            boxShadow: isPlayingSoundscape ? `0 0 20px ${settings.theme.primaryColor}30` : 'none',
          }}
          title="Toggle Atelier Atmosphere Audio"
        >
          {/* Animated Equalizer Bars */}
          {isPlayingSoundscape ? (
            <div className="flex items-end gap-0.5 h-3.5 w-3.5">
              <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-amber-300 rounded-full animate-bounce h-2" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-amber-500 rounded-full animate-bounce h-3.5" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <VolumeX className="w-4 h-4 text-stone-400 group-hover:text-amber-400 transition-colors" />
          )}

          <span className="text-xs font-semibold tracking-wider text-amber-100/90 group-hover:text-amber-300 transition-colors hidden sm:inline">
            {isPlayingSoundscape ? 'Lounge Ambience' : 'Sound ON'}
          </span>

          <span 
            onClick={(e) => {
              e.stopPropagation();
              toggleSoundscape();
            }}
            className="p-1 rounded-full hover:bg-amber-500/20 text-amber-400 transition-colors"
          >
            {isPlayingSoundscape ? <Volume2 className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
          </span>
        </button>
      </div>
    </div>
  );
}
