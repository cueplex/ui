// HoverCard — Rich Hover-Tooltip mit Header / Body / Footer-Slots.
// Patrick 29.04.2026: native title-Attribut ist haesslich, wir wollen eine
// huebsche Card mit visueller Hierarchie + Notiz-Feld.
//
// API:
//   <HoverCard content={...} delayMs={300}><div>Trigger</div></HoverCard>
//
// Feature:
//   - Mouseenter > delay -> Card erscheint, mouseleave -> verschwindet
//   - Position: rechts neben dem Trigger, mit Auto-Flip wenn rechts kein Platz
//   - Content kann beliebige ReactNode sein (Title, Body, Notiz, Stats)
//   - Slots als Convenience: HoverCardHeader / HoverCardBody / HoverCardNote
//   - Verwendet cueplex-Tokens: --bg-card, --border-default, --shadow-lg

import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from 'react';

// Modul-globale "Bridge": wenn ein HoverCard innerhalb von 200ms nach Schließen
// eines anderen aufgeht, ueberspringen wir die Einblend-Animation. So wirkt das
// Wechseln zwischen Triggern nahtlos statt zappelig.
let _lastClosedAt = 0;

export interface HoverCardProps {
  /** Card-Inhalt — typischerweise eine Komposition aus HoverCardHeader/Body/Note */
  content: ReactNode;
  /** Trigger-Element (children werden in span gewrappt) */
  children: ReactNode;
  /** Delay vor Anzeige in ms. Default 300. */
  delayMs?: number;
  /** Min-Breite des Card-Panels. Default 280. */
  minWidth?: number;
  /** Max-Breite des Card-Panels. Default 360. */
  maxWidth?: number;
  /** Disable: kein Hover-Verhalten (z.B. wenn content leer ist). Default false. */
  disabled?: boolean;
}

export function HoverCard({
  content,
  children,
  delayMs = 200,
  minWidth = 240,
  maxWidth = 300,
  disabled = false,
}: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const [skipAnim, setSkipAnim] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onEnter = () => {
    if (disabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      // Patrick 29.04.2026 v2: rechts vom Trigger, top-bündig.
      // Flip nach links wenn rechts nicht genug Platz; vertical clamp im Viewport.
      const padding = 8;
      const fitsRight = r.right + padding + maxWidth < window.innerWidth - 8;
      const left = fitsRight ? r.right + padding : Math.max(8, r.left - maxWidth - padding);
      const top = Math.max(8, Math.min(window.innerHeight - 100, r.top));
      // Wenn binnen 200ms nach letztem Close: skip animation (Wechsel zwischen Triggern)
      setSkipAnim(Date.now() - _lastClosedAt < 200);
      setPos({ left, top });
      setOpen(true);
    }, delayMs);
  };

  const onLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (open) _lastClosedAt = Date.now();
    setOpen(false);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        // display:contents würde getBoundingClientRect() zu 0/0 machen — Patrick-Bug
        // 29.04.: HoverCard erschien oben links statt am Trigger. inline-block hat
        // ein eigenes Box-Modell und liefert korrekte Trigger-Position.
        style={{ display: 'inline-block' }}
      >
        {children}
      </span>
      {open && pos && (
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            left: pos.left,
            top: pos.top,
            minWidth,
            maxWidth,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '10px 12px',
            zIndex: 1400,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            pointerEvents: 'none',
            // Animation nur beim ersten Show, nicht bei Trigger-Wechsel.
            animation: skipAnim ? 'none' : 'cxl-hovercard-in 120ms ease-out',
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}

// Convenience-Slots fuer Komposition

export function HoverCardHeader({
  title,
  subtitle,
  icon,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div style={hcHeaderStyle}>
      {icon && <span style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}>{icon}</span>}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={hcTitleStyle}>{title}</div>
        {subtitle && <div style={hcSubtitleStyle}>{subtitle}</div>}
      </div>
    </div>
  );
}

export function HoverCardRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div style={hcRowStyle}>
      <span style={hcRowLabelStyle}>{label}</span>
      <span style={hcRowValueStyle}>{value}</span>
    </div>
  );
}

export function HoverCardNote({ children }: { children: ReactNode }) {
  return <div style={hcNoteStyle}>{children}</div>;
}

// ─── Styles ────────────────────────────────────────────

const hcHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  paddingBottom: 8,
  borderBottom: '1px solid var(--border-light)',
};

const hcTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text-primary)',
  lineHeight: 1.3,
};

const hcSubtitleStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--text-tertiary)',
  fontFamily: 'var(--font-mono)',
  marginTop: 2,
};

const hcRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: 8,
  fontSize: 12,
};

const hcRowLabelStyle: CSSProperties = {
  color: 'var(--text-tertiary)',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const hcRowValueStyle: CSSProperties = {
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  textAlign: 'right',
};

const hcNoteStyle: CSSProperties = {
  marginTop: 4,
  paddingTop: 8,
  borderTop: '1px solid var(--border-light)',
  fontSize: 12,
  color: 'var(--text-secondary)',
  fontStyle: 'italic',
  lineHeight: 1.4,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};
