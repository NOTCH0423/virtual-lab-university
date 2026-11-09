export type Theme = 'light' | 'dark' | 'system';
export interface Preferences {
  notifications: { email: boolean; push: boolean; weekly: boolean; achievements: boolean };
  appearance: { theme: Theme; animations: boolean };
  privacy: { showProfile: boolean; showProgress: boolean };
}
export const defaultPreferences: Preferences = {
  notifications: { email: true, push: true, weekly: true, achievements: true },
  appearance: { theme: 'dark', animations: true },
  privacy: { showProfile: true, showProgress: true },
};
const KEY = (userKey?: string) => `vlab:preferences${userKey ? ':' + userKey : ''}`;
export const LAST_KEY = 'vlab:preferences:last';

export function loadPreferences(userKey?: string): Preferences {
  if (typeof window === 'undefined') return defaultPreferences;
  try {
    const raw = localStorage.getItem(KEY(userKey)) || localStorage.getItem(LAST_KEY);
    if (!raw) return defaultPreferences;
    const p = JSON.parse(raw);
    return {
      notifications: { ...defaultPreferences.notifications, ...p.notifications },
      appearance: { ...defaultPreferences.appearance, ...p.appearance },
      privacy: { ...defaultPreferences.privacy, ...p.privacy },
    };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(prefs: Preferences, userKey?: string) {
  const raw = JSON.stringify(prefs);
  localStorage.setItem(KEY(userKey), raw);
  localStorage.setItem(LAST_KEY, raw);
  applyAppearance(prefs.appearance);
}

export function applyAppearance(a: Preferences['appearance']) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const dark =
    a.theme === 'dark' ||
    (a.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', dark);
  root.classList.toggle('light', !dark);
  root.classList.toggle('no-animations', !a.animations);
}
