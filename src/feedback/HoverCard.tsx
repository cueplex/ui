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
  delayMs = 300,
  minWidth = 280,
  maxWidth = 360,
  disabled = false,
}: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onEnter = () => {
    if (disabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      // Default rechts vom Trigger; flip nach links wenn nicht genug Platz
      const wantLeft = r.right + 8;
      const fitsRight = wantLeft + maxWidth < window.innerWidth - 8;
      const left = fitsRight ? wantLeft : Math.max(8, r.left - maxWidth - 8);
      const top = Math.min(window.innerHeight - 16, Math.max(16, r.top));
      setPos({ left, top });
      setOpen(true);
    }, delayMs);
  };

  const onLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
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
        style={{ display: 'contents' }}
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
            padding: '12px 14px',
            zIndex: 1400,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            pointerEvents: 'none',
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
