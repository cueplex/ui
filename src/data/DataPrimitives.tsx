import type { ReactNode, CSSProperties, TableHTMLAttributes, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

/**
 * Data-Primitives: Tabellen-, Status- und Hint-Komponenten für ops/Articles, Geräte, Logbuch etc.
 * Theme-aware via CSS-vars, keine hardcoded Farben.
 */

// ─── DataTable ─────────────────────────────────────────

export interface DataTableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export function DataTable({ children, style, ...rest }: DataTableProps) {
  return (
    <table {...rest} style={{ ...tableStyle, ...style }}>
      {children}
    </table>
  );
}

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
};

// CSS-Klassen müssen via parent-CSS oder per inline applied werden. Nutzbar:
// <thead><tr><th className="dt-th">Header</th></tr></thead>
// <tbody><tr><td className="dt-td">Cell</td></tr></tbody>
// Die Konsumenten können auch direkt th/td styling nutzen.

// ─── StatusDot ─────────────────────────────────────────

export type StatusDotIntent = 'ok' | 'warn' | 'crit' | 'neutral';

export interface StatusDotProps {
  intent: StatusDotIntent;
  label?: string;
}

export function StatusDot({ intent, label }: StatusDotProps) {
  const colors: Record<StatusDotIntent, string> = {
    ok: 'var(--status-bestaetigt, #5B8A5E)',
    warn: 'var(--status-angefragt, #C4A44A)',
    crit: 'var(--status-abgelehnt, #B85C5C)',
    neutral: 'var(--text-tertiary, #9B9488)',
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: colors[intent],
        }}
      />
      {label && <span>{label}</span>}
    </span>
  );
}

// ─── Pill (Tag-Pill) ──────────────────────────────────

export interface PillProps {
  children: ReactNode;
  intent?: 'neutral' | 'accent' | 'warn' | 'success' | 'danger';
}

export function Pill({ children, intent = 'neutral' }: PillProps) {
  const styles: Record<NonNullable<PillProps['intent']>, CSSProperties> = {
    neutral: { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' },
    accent: { background: 'var(--accent-primary)', color: 'var(--accent-primary-text)' },
    warn: { background: 'var(--status-angefragt-bg)', color: 'var(--status-angefragt)' },
    success: { background: 'var(--status-bestaetigt-bg)', color: 'var(--status-bestaetigt)' },
    danger: { background: 'var(--status-abgelehnt-bg, #FAEFEF)', color: 'var(--status-abgelehnt)' },
  };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 8px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 500,
        ...styles[intent],
      }}
    >
      {children}
    </span>
  );
}

// ─── RowAction (Tabellen-Icon-Button) ─────────────────

export interface RowActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function RowAction({ children, style, ...rest }: RowActionProps) {
  return (
    <button {...rest} style={{ ...rowActionStyle, ...style }}>
      {children}
    </button>
  );
}

const rowActionStyle: CSSProperties = {
  width: 24,
  height: 24,
  border: 'none',
  background: 'transparent',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--radius-sm, 8px)',
  cursor: 'pointer',
  color: 'var(--text-tertiary)',
};

// ─── RowLink (Mono-Accent-Link in Tabellen-Zellen) ───

export interface RowLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

export function RowLink({ children, style, ...rest }: RowLinkProps) {
  return (
    <a {...rest} style={{ ...rowLinkStyle, ...style }}>
      {children}
    </a>
  );
}

const rowLinkStyle: CSSProperties = {
  color: 'var(--accent-primary)',
  cursor: 'pointer',
  textDecoration: 'none',
  fontFamily: 'var(--font-mono)',
};

// ─── InfoBanner (Hint) ────────────────────────────────

export type InfoBannerIntent = 'info' | 'warn' | 'success';

export interface InfoBannerProps {
  intent?: InfoBannerIntent;
  icon?: ReactNode;
  children: ReactNode;
}

export function InfoBanner({ intent = 'info', icon, children }: InfoBannerProps) {
  const styles: Record<InfoBannerIntent, CSSProperties> = {
    info: {
      background: 'var(--status-angefragt-bg)',
      border: '1px solid var(--status-angefragt)',
      color: 'var(--text-secondary)',
    },
    warn: {
      background: 'var(--status-angefragt-bg)',
      border: '1px solid var(--status-angefragt)',
      color: 'var(--status-angefragt)',
    },
    success: {
      background: 'var(--status-bestaetigt-bg)',
      border: '1px solid var(--status-bestaetigt)',
      color: 'var(--text-secondary)',
    },
  };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 'var(--radius-sm, 8px)',
        fontSize: 12,
        ...styles[intent],
      }}
    >
      {icon && <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>}
      <span style={{ flex: 1 }}>{children}</span>
    </div>
  );
}
