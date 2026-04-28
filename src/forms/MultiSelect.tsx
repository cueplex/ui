// MultiSelect: Dropdown mit Checkboxen fuer Multi-Filter (z.B. Status: anfrage + planung).
// Bewusst klein gehalten, ohne Such-Filter — kann spaeter erweitert werden.
// Schliesst bei click-outside; Tastatur: ESC schliessen, Enter toggelt.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface MultiSelectOption<V extends string = string> {
  value: V;
  label: string;
  /** Optionaler farbiger Punkt links neben dem Label (z.B. Status-Farbe) */
  dotColor?: string;
}

export interface MultiSelectProps<V extends string = string> {
  options: MultiSelectOption<V>[];
  values: V[];
  onChange: (values: V[]) => void;
  /** Sichtbarer Trigger-Text wenn nichts/alles gewaehlt */
  placeholder?: string;
  /** Custom Trigger (z.B. Icon-Button) statt Default-Button */
  trigger?: ReactNode;
  /** Optionaler Header im Dropdown */
  header?: ReactNode;
  disabled?: boolean;
  /**
   * Exclude-Mode (Filter „was NICHT zeigen"):
   * - Häkchen-Logik invertiert: alle defaultmäßig mit Häkchen, User entfernt
   *   Häkchen für was er ausblenden will. Toggle behält die selbe Semantik
   *   in `values` (= ausgeblendete Werte), nur die UI-Anzeige ist invertiert.
   * - triggerLabel: „Alle sichtbar" bei leer, sonst „N ausgeblendet".
   */
  excludeMode?: boolean;
}

export function MultiSelect<V extends string = string>({
  options,
  values,
  onChange,
  placeholder = 'Auswählen…',
  trigger,
  header,
  disabled,
  excludeMode,
}: MultiSelectProps<V>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (ev: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(ev.target as Node)) setOpen(false);
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (v: V) => {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  };

  const triggerLabel: string = (() => {
    if (excludeMode) {
      if (values.length === 0) return placeholder; // Caller sollte „Alle sichtbar" o.ä. übergeben
      if (values.length === options.length) return 'Alle ausgeblendet';
      return `${values.length} ausgeblendet`;
    }
    if (values.length === 0) return placeholder;
    if (values.length === options.length) return 'Alle';
    if (values.length === 1) {
      const opt = options.find((o) => o.value === values[0]);
      return opt?.label ?? String(values[0]);
    }
    return `${values.length} ausgewählt`;
  })();

  const triggerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 'var(--radius-sm, 8px)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)',
    fontSize: 'var(--font-size-body, 13px)',
    fontFamily: 'var(--font-sans)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    minHeight: 32,
  };

  const dropdownStyle: CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    minWidth: '100%',
    maxHeight: 320,
    overflowY: 'auto',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md, 10px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    zIndex: 1000,
    padding: 4,
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      {trigger ? (
        <span onClick={() => !disabled && setOpen((o) => !o)}>{trigger}</span>
      ) : (
        <button
          type="button"
          onClick={() => !disabled && setOpen((o) => !o)}
          style={triggerStyle}
          disabled={disabled}
        >
          <span style={{ flex: 1, textAlign: 'left' }}>{triggerLabel}</span>
          <ChevronDown size={14} style={{ opacity: 0.6 }} />
        </button>
      )}

      {open && (
        <div style={dropdownStyle} role="listbox" aria-multiselectable="true">
          {header && (
            <div
              style={{
                padding: '6px 10px',
                fontSize: 'var(--font-size-xs, 10px)',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid var(--border-light)',
                marginBottom: 4,
              }}
            >
              {header}
            </div>
          )}
          {options.map((opt) => {
            // exclude-Mode: visuelles checked = nicht-in-values (=sichtbar).
            // Toggle-Logik bleibt: values enthält die ausgeblendeten Items.
            const inExclusions = values.includes(opt.value);
            const checked = excludeMode ? !inExclusions : inExclusions;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={checked}
                onClick={() => toggle(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-body, 13px)',
                  color: 'var(--text-primary)',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: '1px solid var(--border-default)',
                    background: checked ? 'var(--accent-primary)' : 'var(--bg-card)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {checked && <Check size={12} style={{ color: 'var(--accent-primary-text, #fff)' }} />}
                </span>
                {opt.dotColor && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: opt.dotColor,
                      flexShrink: 0,
                    }}
                  />
                )}
                <span style={{ flex: 1 }}>{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
