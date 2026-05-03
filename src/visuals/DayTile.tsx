import type { CSSProperties } from 'react';

/**
 * DayTile — kompakte Datums-Kachel als Tag-Header-Element.
 *
 *  ┌──────────┐
 *  │ APR      │ ← Monat, 10px Caption, Tertiary
 *  │ 28       │ ← Tag-Nummer, 22px Bold
 *  └──────────┘
 *
 * Variante "today" tönt mit accent-primary, "weekend" mit bg-tertiary.
 * Theme-aware via CSS-vars. Inter-only (kein Mono — bricht sonst mit Header-Typo).
 */

export type DayTileVariant = 'default' | 'today' | 'weekend';

export interface DayTileProps {
  /** Tag-Nummer (1–31). */
  num: number;
  /** Monat als Kürzel (z.B. "APR", "MAI"). */
  month: string;
  variant?: DayTileVariant;
  size?: number; // Default 56px
  style?: CSSProperties;
}

export function DayTile({ num, month, variant = 'default', size = 56, style }: DayTileProps) {
  const isToday = variant === 'today';
  const isWeekend = variant === 'weekend';

  const tileStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: 'var(--radius-md, 10px)',
    background: isToday
      ? 'color-mix(in srgb, var(--accent-primary) 10%, var(--bg-secondary))'
      : isWeekend ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
    border: `1px solid ${isToday ? 'var(--accent-primary)' : 'var(--border-light)'}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    flexShrink: 0,
    ...style,
  };

  const numStyle: CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1,
    color: isToday ? 'var(--accent-primary)' : 'var(--text-primary)',
    letterSpacing: '-0.02em',
  };

  const monthStyle: CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: 10,
    fontWeight: 600,
    lineHeight: 1,
    color: isToday ? 'var(--accent-primary)' : 'var(--text-tertiary)',
    opacity: isToday ? 0.85 : 1,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  };

  return (
    <div style={tileStyle}>
      <span style={numStyle}>{String(num).padStart(2, '0')}</span>
      <span style={monthStyle}>{month}</span>
    </div>
  );
}
