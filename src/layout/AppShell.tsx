import { useEffect, type ReactNode } from 'react';
import { useTheme } from '../theme/useTheme';

export function AppShell({
  children,
  sidebar,
  header,
}: {
  children: ReactNode;
  sidebar: ReactNode;
  header: ReactNode;
}) {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {sidebar}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {header}
        <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}
