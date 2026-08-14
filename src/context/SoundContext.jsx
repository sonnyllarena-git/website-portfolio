import { createContext, useCallback, useContext, useState } from 'react';
import { playTick, startDrone, setDroneMuted } from '../utils/audioEngine';

const MUTE_STORAGE_KEY = 'soundMuted';

function loadMuted() {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveMuted(muted) {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
  } catch {
    // localStorage may be unavailable (private mode) — preference just won't persist
  }
}

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [muted, setMuted] = useState(loadMuted);

  const unlock = useCallback(() => {
    setUnlocked((already) => {
      if (already) return already;
      startDrone();
      setDroneMuted(loadMuted());
      return true;
    });
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      setDroneMuted(next);
      saveMuted(next);
      return next;
    });
  }, []);

  const tick = useCallback(() => {
    if (!muted) playTick();
  }, [muted]);

  return (
    <SoundContext.Provider value={{ unlocked, unlock, muted, toggleMuted, tick }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within a SoundProvider');
  return ctx;
}
