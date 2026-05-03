import type { CSSProperties } from 'react';

/**
 * ProgressBar — schmaler Balken mit value/max + optionaler Farb-Override.
 *  - color via CSS-Variable oder direkter Hex (z.B. _colorHex aus Backend)
 *  - Höhe konfigurierbar (default 4px)
 *  - opacity dimmbar (für Sub-Bars in Listen)
 */

export interface ProgressBarProps {
  /** 0..max */
  value: number;
  /** default 100 */
  max?: number;
  /** CSS-Variable oder Hex. Default: var(--accent-primary) */
  color?: string;
  /** Höhe in px. Default 4. */
  height?: number;
  /** Track-Hintergrund. Default var(--bg-tertiary). */
  trackColor?: string;
  /** Opacity der Fill-Bar (0..1). Default 0.85 */
  opacity?: number;
  /** Optional: marker-Position (0..max), z.B. "elapsed" Indikator */
  marker?: number;
  style?: CSSProperties;
}

export function ProgressBar({
  value,
  max = 100,
  color = 'var(--accent-primary)',
  height = 4,
  trackColor = 'var(--bg-tertiary)',
  opacity = 0.85,
  marker,
  style,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  const markerPct = marker !== undefined ? Math.max(0, Math.min(100, (marker / Math.max(1, max)) * 100)) : null;
  return (
    <div style={{
      position: 'relative',
      height,
      background: trackColor,
      borderRadius: height / 2,
      overflow: 'visible',
      ...style,
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: color,
        borderRadius: height / 2,
        opacity,
        transition: 'width 0.25s ease',
      }} />
      {markerPct !== null && (
        <div style={{
          position: 'absolute',
          top: -2, bottom: -2,
          left: `${markerPct}%`,
          width: 2,
          // Marker folgt der Bar-Farbe — sonst hätten wir bei Gewerk-Bars (z.B. Ton-blau)
          // einen orangen Marker, was visuell falsch wäre
          background: color,
          borderRadius: 1,
        }} />
      )}
    </div>
  );
}
