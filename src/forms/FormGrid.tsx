import type { ReactNode, CSSProperties } from 'react';

/**
 * FormGrid — Grid-Helper mit cols={1|2|3|4}.
 * Felder können via FormFieldSpan Spalten überspannen.
 */

export interface FormGridProps {
  cols?: 1 | 2 | 3 | 4;
  gap?: number;
  rowGap?: number;
  children: ReactNode;
}

export function FormGrid({ cols = 4, gap = 12, rowGap = 8, children }: FormGridProps) {
  const style: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: `${rowGap}px ${gap}px`,
  };
  return <div style={style}>{children}</div>;
}

export interface FormFieldSpanProps {
  span?: 1 | 2 | 3 | 4;
  children: ReactNode;
}

export function FormFieldSpan({ span = 1, children }: FormFieldSpanProps) {
  return <div style={{ gridColumn: `span ${span}`, minWidth: 0 }}>{children}</div>;
}
