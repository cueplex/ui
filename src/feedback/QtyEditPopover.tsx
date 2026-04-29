// QtyEditPopover — Inline-Number-Input am Trigger-Anker fuer Mengen-Eingabe.
// Patrick 29.04.2026: Plus-Klick soll erst eine Mini-Form aufgehen
// (Anzahl eingeben + Enter), bevor wirklich gebucht wird.
//
// API:
//   <QtyEditPopover defaultQty={1} onConfirm={(qty) => addItem(qty)}>
//     <button>+</button>
//   </QtyEditPopover>
//
// Verhalten:
//   - Klick auf children -> Popover oeffnet, Input fokussiert + selektiert
//   - Enter -> onConfirm(qty), Popover schliesst
//   - Escape / Click-Outside -> Abbruch
//   - Cancel-Button optional (default sichtbar)
//   - Zahl-Input akzeptiert Komma + Punkt, parsed als float

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  type ReactNode,
} from 'react';

export interface QtyEditPopoverProps {
  /** Default-Menge im Input. */
  defaultQty?: number;
  /** Callback bei Confirm (Enter oder Confirm-Button). */
  onConfirm: (qty: number) => void;
  /** Optional Callback wenn der User abbricht. */
  onCancel?: () => void;
  /** Trigger-Element (Plus-Button etc.). Klick toggelt Popover. */
  children: ReactNode;
  /** Label vor Input (z.B. „Menge"). Default „Menge". */
  label?: string;
  /** Min-Wert. Default 1. */
  min?: number;
  /** Suffix nach Input (z.B. „Stk."). */
  suffix?: ReactNode;
}

export function QtyEditPopover({
  defaultQty = 1,
  onConfirm,
  onCancel,
  children,
  label = 'Menge',
  min = 1,
  suffix,
}: QtyEditPopoverProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(defaultQty));
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  const triggerRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const openPopover = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    setValue(String(defaultQty));
    // Patrick 29.04.2026: Popover direkt am Plus-Anker, NICHT fixed-top-corner.
    // Default rechts vom Trigger; flip nach links wenn nicht genug Platz.
    // Vertikal mit Trigger-Center alignen.
    const POPOVER_W = 200;
    const POPOVER_H = 40;
    const fitsRight = r.right + 6 + POPOVER_W < window.innerWidth - 8;
    const left = fitsRight ? r.right + 6 : Math.max(8, r.left - POPOVER_W - 6);
    const top = Math.max(8, Math.min(
      window.innerHeight - POPOVER_H - 8,
      r.top + r.height / 2 - POPOVER_H / 2,
    ));
    setPos({ left, top });
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (open) {
      // Naechster Tick: Input fokussieren + selektieren
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (ev: MouseEvent) => {
      if (popoverRef.current?.contains(ev.target as Node)) return;
      if (triggerRef.current?.contains(ev.target as Node)) return;
      setOpen(false);
      onCancel?.();
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setOpen(false);
        onCancel?.();
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onCancel]);

  const confirm = () => {
    const n = parseFloat(value.replace(',', '.'));
    if (!Number.isFinite(n) || n < min) {
      onCancel?.();
    } else {
      onConfirm(n);
    }
    setOpen(false);
  };

  return (
    <>
      <span
        ref={triggerRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (open) setOpen(false);
          else openPopover();
        }}
        // siehe HoverCard-Kommentar: display:contents bricht getBoundingClientRect.
        style={{ display: 'inline-block' }}
      >
        {children}
      </span>
      {open && pos && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={label}
          style={{
            position: 'fixed',
            left: pos.left,
            top: pos.top,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: 8,
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{
            fontSize: 10, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-tertiary)',
            fontWeight: 600, marginRight: 2,
          }}>{label}</span>
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); confirm(); }
            }}
            style={{
              width: 64,
              padding: '5px 8px',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              textAlign: 'right',
              outline: 'none',
            }}
          />
          {suffix && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{suffix}</span>
          )}
          <button
            type="button"
            onClick={confirm}
            style={{
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'var(--accent-primary)',
              color: 'var(--accent-primary-text, #fff)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Buchen
          </button>
        </div>
      )}
    </>
  );
}
