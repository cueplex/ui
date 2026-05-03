import type { ReactNode, CSSProperties } from 'react';

/**
 * StampAnchor — Stempel-In/Out-Streifen für Zeiterfassungs-Cards.
 *
 *  IN:  ┌────────────────────────────────────┐
 *       │ [✓ icon]  07:45  EINGESTEMPELT     │ ← bg-secondary, accent-tinted icon
 *       └────────────────────────────────────┘
 *
 *  OUT: ┌────────────────────────────────────┐
 *       │ [✗ icon]  18:00  AUSGESTEMPELT  6:25 h │ ← bg-secondary, neutral icon, sum rechts
 *       └────────────────────────────────────┘
 *
 * Sum (Block-Dauer) nur bei out-Variante sinnvoll. Theme-aware.
 */

export type StampAnchorKind = 'in' | 'out';

export interface StampAnchorProps {
  kind: StampAnchorKind;
  /** Icon (z.B. Lucide LogIn / LogOut), wird in 16px in einer Wrap-Box gerendert. */
  icon: ReactNode;
  /** Zeit-String, z.B. "07:45". Wird mit Mono-Font gerendert. */
  time: string;
  /** Label, z.B. "Eingestempelt". Wird uppercase. */
  label: string;
  /** Optional: Block-Dauer rechts (z.B. "6:25 h" bei Stempel-Out). */
  sum?: string;
  /** Optional: Live-Pulse anzeigen (z.B. für aktuell laufenden Eintrag). */
  livePulse?: boolean;
  /** Hover-/Click-Handler für Inline-Edit der Stempel-Zeit. */
  onClick?: () => void;
}

export function StampAnchor({ kind, icon, time, label, sum, livePulse, onClick }: StampAnchorProps) {
  const isIn = kind === 'in';

  const wrapStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 18px',
    background: 'var(--bg-secondary)',
    cursor: onClick ? 'pointer' : 'default',
  };

  const iconWrapStyle: CSSProperties = {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm, 8px)',
    background: isIn
      ? 'color-mix(in srgb, var(--accent-primary) 15%, transparent)'
      : 'color-mix(in srgb, var(--text-tertiary) 18%, transparent)',
    color: isIn ? 'var(--accent-primary)' : 'var(--text-secondary)',
    flexShrink: 0,
  };

  const timeStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 17,
    fontWeight: 700,
    color: 'var(--text-primary)',
  };

  const labelStyle: CSSProperties = {
    fontSize: 11,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const sumStyle: CSSProperties = {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'var(--font-mono)',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--accent-primary)',
    letterSpacing: '-0.01em',
  };

  const pulseStyle: CSSProperties = {
    flex: 1,
    textAlign: 'right',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    color: 'var(--accent-primary)',
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  return (
    <div style={wrapStyle} onClick={onClick}>
      <div style={iconWrapStyle}>{icon}</div>
      <div>
        <div style={timeStyle}>{time}</div>
        <div style={labelStyle}>{label}</div>
      </div>
      {sum && !livePulse && <div style={sumStyle}>{sum}</div>}
      {livePulse && (
        <div style={pulseStyle}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              animation: 'cxl-pulse 1.6s ease-out infinite',
            }}
          />
          läuft
        </div>
      )}
    </div>
  );
}
