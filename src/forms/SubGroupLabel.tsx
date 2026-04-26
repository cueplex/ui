import type { ReactNode, CSSProperties } from 'react';

/**
 * SubGroupLabel — kleine uppercase-Label-Linie für Sub-Gruppen innerhalb einer Section.
 * Visuelle Trennung via horizontaler Linie nach dem Text.
 * Wird in einem Form-Grid platziert mit gridColumn: '1 / -1' damit es die volle Breite nimmt.
 */

export interface SubGroupLabelProps {
  children: ReactNode;
  spaceTop?: number;
}

export function SubGroupLabel({ children, spaceTop = 14 }: SubGroupLabelProps) {
  const style: CSSProperties = {
    gridColumn: '1 / -1',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
    color: 'var(--text-tertiary)',
    fontWeight: 700,
    paddingTop: spaceTop,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };
  return (
    <div style={style}>
      <span>{children}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
    </div>
  );
}
