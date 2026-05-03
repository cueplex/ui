import type { CSSProperties, ReactNode } from 'react';

/**
 * DonutGauge — kreisförmige Multi-Segment-Anzeige (z.B. Urlaub-Konto: taken/planned/free).
 *
 *  ┌──────────────┐
 *  │    ┌────┐    │   Center: numerische Anzeige (z.B. "21" Tage Resturlaub)
 *  │    │ 21 │    │   Label drunter (z.B. "Resturlaub")
 *  │    │ Tg │    │   Optional: Sub-Meta (z.B. "von 30 Tagen")
 *  │    └────┘    │
 *  │    ◌◌◌◌◌    │   Donut-Ring mit N farbigen Segments
 *  └──────────────┘
 *
 * Segments werden gegen-im-Uhrzeigersinn gerendert ab 12 Uhr.
 * Theme-aware via CSS-Vars. Inline-Style-only (keine CSS-Module).
 */

export type DonutSegment = {
  /** Anteil (0..1) am Total. Summe aller Segments sollte ≤1 sein. */
  value: number;
  /** Farbe (CSS-Var oder Hex). */
  color: string;
};

export interface DonutGaugeProps {
  segments: DonutSegment[];
  /** Center-Wert (z.B. Zahl als string oder ReactNode für custom layout). */
  value: ReactNode;
  /** Label unter dem Wert (z.B. "Resturlaub"). */
  label?: string;
  /** Optional: dritte Zeile (z.B. "von 30 Tagen"). */
  meta?: string;
  /** Größe in px. Default 160. */
  size?: number;
  /** Stroke-Breite. Default 14. */
  thickness?: number;
  /** Track-Farbe (Hintergrund-Ring). Default --bg-tertiary. */
  trackColor?: string;
  style?: CSSProperties;
}

export function DonutGauge({
  segments,
  value,
  label,
  meta,
  size = 160,
  thickness = 14,
  trackColor = 'var(--bg-tertiary)',
  style,
}: DonutGaugeProps) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  // Cumulative offset für Segments
  let offsetSoFar = 0;
  const segmentNodes = segments.map((seg, i) => {
    const len = Math.max(0, Math.min(1, seg.value)) * c;
    const dashArray = `${len} ${c - len}`;
    const dashOffset = -offsetSoFar;
    offsetSoFar += len;
    return (
      <circle
        key={i}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={seg.color}
        strokeWidth={thickness}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        strokeLinecap="butt"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
  });

  return (
    <div style={{ ...wrapStyle, width: size, height: size, ...style }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={thickness} />
        {segmentNodes}
      </svg>
      <div style={centerStyle}>
        <div style={valueStyle}>{value}</div>
        {label && <div style={labelStyle}>{label}</div>}
        {meta && <div style={metaStyle}>{meta}</div>}
      </div>
    </div>
  );
}

const wrapStyle: CSSProperties = {
  position: 'relative',
};

const centerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const valueStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 32,
  fontWeight: 700,
  color: 'var(--accent-primary)',
  letterSpacing: '-0.02em',
  lineHeight: 1,
};

const labelStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginTop: 4,
};

const metaStyle: CSSProperties = {
  fontSize: 10,
  color: 'var(--text-tertiary)',
  fontFamily: 'var(--font-mono)',
  marginTop: 2,
};
