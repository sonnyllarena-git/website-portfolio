const STORAGE_KEY = 'chatVoicePrefs';

const BASE_DEFAULTS = {
  voiceInputEnabled: true,
  voiceOutputEnabled: true,
  language: 'en-US',
  rate: 1,
  volume: 1,
};

export function loadVoicePrefs() {
  const defaults = {
    ...BASE_DEFAULTS,
    language: (typeof navigator !== 'undefined' && navigator.language) || BASE_DEFAULTS.language,
  };

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaults, ...stored };
  } catch {
    return defaults;
  }
}

export function saveVoicePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage may be unavailable (private mode) — prefs just won't persist
  }
}
