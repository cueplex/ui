import type { CSSProperties, ReactNode } from 'react';

/**
 * ColorLegend — kompakte Farb-Legende für Gantt/Listen wenn Bar-Farbe nach
 * Status oder Projekttyp gefärbt ist. Pattern aus crew/EventsPage.tsx
 * extrahiert (28.04.2026, Patrick: globalisieren statt pro Modul kopieren).
 */

export interface ColorLegendItem {
  label: string;
  color: string;
}

export interface ColorLegendProps {
  items: ColorLegendItem[];
  /** Optionaler Header-Text links vom ersten Item (z.B. „Status:"). */
  prefix?: ReactNode;
  /** Größe der Color-Swatches in px (default 10). */
  swatchSize?: number;
}

export function ColorLegend({ items, prefix, swatchSize = 10 }: ColorLegendProps) {
  if (items.length === 0) return null;
  return (
    <div style={containerStyle}>
      {prefix && <span style={prefixStyle}>{prefix}</span>}
      {items.map((it) => (
        <span key={it.label} style={itemStyle}>
          <span
            style={{
              display: 'inline-block',
              width: swatchSize,
              height: swatchSize,
              borderRadius: 2,
              background: it.color,
              flexShrink: 0,
            }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

const containerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '0 4px',
  fontSize: 'var(--font-size-xs, 11px)',
  color: 'var(--text-tertiary)',
  flexWrap: 'wrap',
};

const prefixStyle: CSSProperties = {
  fontWeight: 600,
  color: 'var(--text-secondary)',
};

const itemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  whiteSpace: 'nowrap',
};
