// @cueplex/ui v0.1.0 — Shared UI Package

// Layout
export { AppShell } from './layout/AppShell';
export { Sidebar, type NavSection, type NavItem } from './layout/Sidebar';
export { Header } from './layout/Header';
export { ThemeToggle } from './layout/ThemeToggle';

// Branding
export { CxLogoTextIcon, CxLogoIcon } from './layout/CxLogo';

// Auth
export { AuthProvider } from './auth/AuthProvider';
export { useAuth, type AuthContextValue } from './auth/useAuth';
export { UserMenu } from './auth/UserMenu';

// Visuals
export { Gantt } from './visuals/Gantt';

// Theme-Store (Hook for consumers)
export { useTheme } from './theme/useTheme';
