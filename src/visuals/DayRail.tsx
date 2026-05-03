import type { CSSProperties } from 'react';

/**
 * DayRail — vertikale Tages-Schiene mit Stunden-Achse + Segments + optionalen Stempel-Markern.
 *
 * Range adaptiv über fromHour..toHour (z.B. 7..18 = 11h Spanne). Segments werden mit
 * top%/height% relativ zur Range gerendert.
 *
 * `flipped`-Prop spiegelt Track via scaleY(-1) damit top=0 das Tagesende ist —
 * passend zur Card-Reihenfolge "Stempel-Out oben".
 */

export type RailSegment = {
  /** Start-Minute innerhalb des Tages (0–1439). */
  startMin: number;
  /** End-Minute innerhalb des Tages. Bei laufendem Eintrag = Now. */
  endMin: number;
  /**
   * Visuelle Variante:
   *   - 'project': solid Gewerk-Farbe (color erforderlich)
   *   - 'pause': Stipple/Schraffur
   *   - 'empty': dezenter Tertiary-Streifen (für "Anwesenheit ohne Projekt")
   */
  kind: 'project' | 'pause' | 'empty';
  /** Hex/Var-Farbe für project-Segments. */
  color?: string;
  /** Optional: Tooltip-Text. */
  title?: string;
};

export interface DayRailProps {
  /** Stunde des Tages, ab der die Range beginnt (0–23). Mind. 30min Puffer empfohlen. */
  fromHour: number;
  /** Stunde, bis zu der die Range geht (1–24). */
  toHour: number;
  segments: RailSegment[];
  /** Stempel-In-Marker (Minute innerhalb des Tages). Wird als 3px Sage-Kappe gerendert. */
  stampInMin?: number;
  /** Stempel-Out-Marker (Minute innerhalb des Tages). Wird als 3px Tertiary-Kappe gerendert. */
  stampOutMin?: number;
  /** Wenn true: Track via scaleY(-1) gespiegelt (passend zu column-reverse Cards). */
  flipped?: boolean;
  width?: number; // Default 56px
  style?: CSSProperties;
}

export function DayRail({ fromHour, toHour, segments, stampInMin, stampOutMin, flipped, width = 56, style }: DayRailProps) {
  const rangeMin = (toHour - fromHour) * 60;
  const fromMin = fromHour * 60;

  const pct = (min: number) => ((min - fromMin) / rangeMin) * 100;

  const wrapStyle: CSSProperties = {
    position: 'relative',
    width,
    padding: '8px 8px 8px 0',
    ...style,
  };

  const axisStyle: CSSProperties = {
    position: 'absolute',
    right: 12,
    top: 8,
    bottom: 8,
    display: 'flex',
    flexDirection: flipped ? 'column-reverse' : 'column',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    color: 'var(--text-tertiary)',
    textAlign: 'right',
    pointerEvents: 'none',
  };

  const trackStyle: CSSProperties = {
    position: 'absolute',
    right: 0,
    top: 8,
    bottom: 8,
    width: 8,
    background: 'var(--bg-tertiary)',
    borderRadius: 4,
    overflow: 'hidden',
    transform: flipped ? 'scaleY(-1)' : undefined,
  };

  // Stunden-Labels generieren (alle 2-3h, je nach Range)
  const hourLabels: number[] = [];
  const step = rangeMin > 600 ? 3 : rangeMin > 360 ? 2 : 1;
  for (let h = fromHour; h <= toHour; h += step) hourLabels.push(h);
  if (hourLabels[hourLabels.length - 1] !== toHour) hourLabels.push(toHour);

  return (
    <div style={wrapStyle}>
      <div style={axisStyle}>
        {hourLabels.map((h) => (
          <span key={h}>
            {String(h).padStart(2, '0')}
          </span>
        ))}
      </div>
      <div style={trackStyle}>
        {segments.map((s, i) => {
          const top = pct(s.startMin);
          const height = Math.max(0.5, pct(s.endMin) - pct(s.startMin));
          const segStyle: CSSProperties = {
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${top}%`,
            height: `${height}%`,
            ...(s.kind === 'pause'
              ? {
                  background: 'repeating-linear-gradient(135deg, transparent 0 3px, var(--text-secondary) 3px 6px)',
                  opacity: 0.55,
                }
              : s.kind === 'empty'
              ? { background: 'var(--text-tertiary)', opacity: 0.18 }
              : { background: s.color ?? 'var(--text-secondary)' }),
          };
          return <div key={i} style={segStyle} title={s.title} />;
        })}
        {stampInMin !== undefined && (
          <div
            style={{
              position: 'absolute',
              left: -3,
              right: -3,
              height: 3,
              top: `${pct(stampInMin)}%`,
              background: 'var(--accent-primary)',
              borderRadius: 2,
              zIndex: 2,
            }}
          />
        )}
        {stampOutMin !== undefined && (
          <div
            style={{
              position: 'absolute',
              left: -3,
              right: -3,
              height: 3,
              top: `${pct(stampOutMin)}%`,
              background: 'var(--text-tertiary)',
              borderRadius: 2,
              zIndex: 2,
            }}
          />
        )}
      </div>
    </div>
  );
}
