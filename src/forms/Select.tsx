// Select — Single-Select Dropdown mit ChevronDown-Trigger und optionalem dotColor.
// Pendant zu MultiSelect (Checkboxen) — fuer Single-Select-Filter (z.B. Bar-Farbe-Modus).
// Pattern bewusst kompatibel mit MultiSelectOption (gleiche dotColor-Konvention).

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
  /** Optionaler farbiger Punkt links neben dem Label */
  dotColor?: string;
}

export interface SelectProps<V extends string = string> {
  value: V | '';
  options: SelectOption<V>[];
  onChange: (value: V) => void;
  placeholder?: string;
  width?: number | string;
  disabled?: boolean;
}

export function Select<V extends string = string>({
  value,
  options,
  onChange,
  placeholder = 'Auswählen…',
  width,
  disabled,
}: SelectProps<V>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (ev: MouseEvent) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) setOpen(false);
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

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder;

  const triggerStyle: CSSProperties = {
    width: '100%',
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    padding: '0 8px 0 10px',
    borderRadius: 'var(--radius-md, 10px)',
    border: '1px solid var(--border-default)',
    background: 'var(--bg-input, var(--bg-card))',
    color: selected ? 'var(--text-primary)' : 'var(--text-tertiary)',
    fontSize: 12,
    cursor: disabled ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontFamily: 'var(--font-sans)',
    opacity: disabled ? 0.5 : 1,
  };

  const dropdownStyle: CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 50,
    marginTop: 4,
    minWidth: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md, 10px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    padding: 4,
    maxHeight: 240,
    overflowY: 'auto',
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', width }}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        style={triggerStyle}
        disabled={disabled}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selected?.dotColor && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: selected.dotColor, flexShrink: 0 }} />
          )}
          {displayLabel}
        </span>
        <ChevronDown
          size={12}
          style={{
            flexShrink: 0,
            opacity: 0.5,
            transform: open ? 'rotate(180deg)' : undefined,
            transition: 'transform 150ms',
          }}
        />
      </button>

      {open && (
        <div style={dropdownStyle}>
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  border: 'none',
                  background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                  borderRadius: 'var(--radius-sm, 8px)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {opt.dotColor && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: opt.dotColor, flexShrink: 0 }} />
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
