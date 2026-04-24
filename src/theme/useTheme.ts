import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark' | 'disco';

const THEME_KEY = 'cueplex-theme';
const SIDEBAR_KEY = 'cueplex-sidebar-collapsed';

interface ThemeState {
  theme: Theme;
  sidebarCollapsed: boolean;
}

function readInitialTheme(): Theme {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) : null;
    if (stored === 'light' || stored === 'dark' || stored === 'disco') return stored;
  } catch {
    /* ignore */
  }
  try {
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  } catch {
    return 'dark';
  }
}

function readInitialSidebarCollapsed(): boolean {
  // Default: eingeklappt. User kann ueber Toggle-Button aufklappen, persistiert
  // via localStorage. Nur wenn explizit "0" gespeichert ist -> aufgeklappt.
  try {
    if (typeof localStorage === 'undefined') return true;
    const v = localStorage.getItem(SIDEBAR_KEY);
    if (v === '0') return false;
    return true;
  } catch {
    return true;
  }
}

// Module-level store mit pub-sub. WICHTIG: state IMMER durch neue Object-Ref
// ersetzen (nicht mutieren), sonst greift useSyncExternalStore nicht
// (Object.is-Vergleich signalisiert sonst kein Change).
let state: ThemeState = {
  theme: readInitialTheme(),
  sidebarCollapsed: readInitialSidebarCollapsed(),
};

// Initial data-theme Attribut setzen (wird sonst erst nach erstem Toggle gesetzt)
try {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', state.theme);
  }
} catch {
  /* ignore */
}

const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): ThemeState {
  return state;
}

function getServerSnapshot(): ThemeState {
  return state;
}

function setTheme(next: Theme): void {
  state = { ...state, theme: next };
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* ignore */
  }
  try {
    document.documentElement.setAttribute('data-theme', next);
  } catch {
    /* ignore */
  }
  emit();
}

function toggleTheme(): void {
  // Normal toggle cyclet light <-> dark. Von disco aus: zurueck zu dark.
  if (state.theme === 'disco') {
    setTheme('dark');
  } else {
    setTheme(state.theme === 'light' ? 'dark' : 'light');
  }
}

function setSidebarCollapsed(v: boolean): void {
  state = { ...state, sidebarCollapsed: v };
  try {
    localStorage.setItem(SIDEBAR_KEY, v ? '1' : '0');
  } catch {
    /* ignore */
  }
  emit();
}

function toggleSidebar(): void {
  setSidebarCollapsed(!state.sidebarCollapsed);
}

export interface UseThemeReturn {
  theme: Theme;
  sidebarCollapsed: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
}

export function useTheme(): UseThemeReturn {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    theme: snap.theme,
    sidebarCollapsed: snap.sidebarCollapsed,
    toggleTheme,
    setTheme,
    toggleSidebar,
    setSidebarCollapsed,
  };
}
