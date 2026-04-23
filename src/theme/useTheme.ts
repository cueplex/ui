import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'cueplex-theme';
const SIDEBAR_KEY = 'cueplex-sidebar-collapsed';

interface ThemeState {
  theme: Theme;
  sidebarCollapsed: boolean;
}

function readInitialTheme(): Theme {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) : null;
    if (stored === 'light' || stored === 'dark') return stored;
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
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(SIDEBAR_KEY) === '1';
  } catch {
    return false;
  }
}

// Module-level store with simple pub-sub
const state: ThemeState = {
  theme: readInitialTheme(),
  sidebarCollapsed: readInitialSidebarCollapsed(),
};

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
  state.theme = next;
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
  setTheme(state.theme === 'light' ? 'dark' : 'light');
}

function setSidebarCollapsed(v: boolean): void {
  state.sidebarCollapsed = v;
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
