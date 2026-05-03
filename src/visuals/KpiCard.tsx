import type { ReactNode, CSSProperties } from 'react';

/**
 * KpiCard — kompakte Kennzahl-Kachel für Dashboards / Stats-Reihen.
 *
 *  ┌─────────────────────────┐
 *  │ LABEL                   │ ← Uppercase, 10px, Tertiary
 *  │ 142:30                  │ ← Mono, 22px, Primary (Intent färbt)
 *  │ 11 Tage · 78% Anteil    │ ← 11px, Tertiary
 *  └─────────────────────────┘
 *
 *  Theme-aware via CSS-vars. Keine hardcoded Farben.
 */

export type KpiIntent = 'default' | 'positive' | 'negative' | 'neutral';

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  meta?: ReactNode;
  intent?: KpiIntent;
  /** Optionaler Schriftgrad für den Wert (default 22px). Nützlich wenn Wert ein längerer String ist. */
  valueSize?: number;
  /** Inline-Style-Override (z.B. min-width). */
  style?: CSSProperties;
}

const intentColors: Record<KpiIntent, string> = {
  default: 'var(--text-primary)',
  positive: 'var(--accent-primary)',
  negative: 'var(--status-abgelehnt)',
  neutral: 'var(--text-secondary)',
};

export function KpiCard({ label, value, meta, intent = 'default', valueSize = 22, style }: KpiCardProps) {
  return (
    <div style={{ ...cardStyle, ...style }}>
      <span style={labelStyle}>{label}</span>
      <span style={{ ...valueStyle, fontSize: valueSize, color: intentColors[intent] }}>{value}</span>
      {meta !== undefined && meta !== null && <span style={metaStyle}>{meta}</span>}
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-light)',
  borderRadius: 'var(--radius-md, 10px)',
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 0,
};

const labelStyle: CSSProperties = {
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-tertiary)',
  fontWeight: 600,
};

const valueStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontWeight: 600,
  lineHeight: 1,
  letterSpacing: '-0.01em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const metaStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--text-tertiary)',
  fontFamily: 'var(--font-mono)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};
