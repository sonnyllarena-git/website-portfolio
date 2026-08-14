const STORAGE_KEY = 'entryGateUnlocked';

export function isGateUnlocked() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markGateUnlocked() {
  try {
    sessionStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // sessionStorage may be unavailable (private mode) — gate just reappears next load
  }
}
