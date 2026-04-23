import type { ReactNode } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from '../auth/UserMenu';

export interface HeaderProps {
  title: string;
  actions?: ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  return (
    <header
      style={{
        height: 52,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0,
      }}
    >
      <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {actions}
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
