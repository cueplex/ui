// Popover — generischer Trigger-Button + Dropdown-Panel mit children-slot.
// Klein gehalten: kein Portal, kein Floating-UI — Position absolute relativ zum Wrapper.
// Schliesst bei click-outside + ESC.

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

export interface PopoverProps {
  /** Inhalt des Trigger-Buttons (typischerweise ein Icon) */
  trigger: ReactNode;
  /** Tooltip-Text fuer den Trigger (optional) */
  triggerTitle?: string;
  /** Panel-Ausrichtung */
  align?: 'left' | 'right';
  /** Min-Breite des Panels */
  minWidth?: number;
  /** Inhalt des Panels */
  children: ReactNode;
}

export function Popover({
  trigger,
  triggerTitle,
  align = 'right',
  minWidth = 220,
  children,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (ev: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(ev.target as Node)) setOpen(false);
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const triggerBtnStyle: CSSProperties = {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm, 8px)',
    border: '1px solid var(--border-default)',
    background: open ? 'var(--bg-tertiary)' : 'transparent',
    color: open ? 'var(--text-primary)' : 'var(--text-secondary)',
    cursor: 'pointer',
  };

  const panelStyle: CSSProperties = {
    position: 'absolute',
    top: '100%',
    [align]: 0,
    marginTop: 6,
    minWidth,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md, 10px)',
    boxShadow: 'var(--shadow-md, 0 8px 24px rgba(0,0,0,0.3))',
    padding: 12,
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  };

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={triggerTitle}
        style={triggerBtnStyle}
      >
        {trigger}
      </button>
      {open && <div style={panelStyle}>{children}</div>}
    </div>
  );
}

// ─── FilterSection — Section mit Uppercase-Label + children ───
export interface FilterSectionProps {
  title: string;
  children: ReactNode;
}

export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <div>
      <div
        style={{
          fontSize: 'var(--font-size-xs, 10px)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-tertiary)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── FilterRow — Label + Control fuer einzelne Filter ───
export interface FilterRowProps {
  label: string;
  children: ReactNode;
}

export function FilterRow({ label, children }: FilterRowProps) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          marginBottom: 4,
          fontSize: 'var(--font-size-sm, 11px)',
          color: 'var(--text-secondary)',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
