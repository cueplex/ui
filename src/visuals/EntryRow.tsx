import { useState, useRef, useEffect, type ReactNode, type CSSProperties, type MouseEvent } from 'react';

/**
 * EntryRow — Einzeilige Daten-Reihe mit Slot-Variante (project / pause / empty / travel / school).
 *
 * Grid: 28px (icon) | 1fr (desc + optional sub) | 200px (proj) | 96px (span) | 60px (dur) | 28px (menu)
 * min-height: 56px — Inhalt vertikal zentriert.
 *
 * Pause hat KEINE Projekt-Spalte (visibility: hidden) damit Zeit/Dauer fluchten.
 * Empty (ohne Projekt) ist opacity 0.55 + kursiv.
 */

export type EntryRowKind = 'project' | 'pause' | 'empty' | 'travel' | 'school';

export interface EntryRowProps {
  kind: EntryRowKind;
  /** Lucide-Icon o.ä. (16px target). */
  icon: ReactNode;
  /** Hauptbeschreibung (z.B. Projektname oder "Pause"). */
  label: string;
  /** Optional: 2. Zeile (z.B. Notiz, oder "automatisch nach §4 ArbZG" bei pause). */
  sublabel?: ReactNode;
  /** Optional: Projekt-Anzeige (Pdot + Nummer). Leer bei pause/empty. */
  proj?: ReactNode;
  /** Zeitspanne, z.B. "09:35–10:00". */
  span: string;
  /** Dauer, z.B. "0:25". */
  duration: string;
  /** Farbe für Project-Icon + Pdot. CSS-var oder Hex. Default: Tertiary. */
  color?: string;
  /** Optional: Menu/Action-Slot rechts (z.B. <MoreHorizontal />). */
  menu?: ReactNode;
  onClick?: (e: MouseEvent) => void;
  /** Aktueller Notiz-Wert für Inline-Edit. Aktiviert die Notiz-Edit-Mechanik. */
  noteValue?: string;
  /** Callback beim onBlur des Notiz-Inputs. Wird nur gerufen wenn sich der Wert geändert hat. */
  onNoteSave?: (value: string) => void;
  /** Placeholder für leeres Notiz-Feld. Default "Notiz hinzufügen…". */
  notePlaceholder?: string;
}

export function EntryRow({ kind, icon, label, sublabel, proj, span, duration, color, menu, onClick, noteValue, onNoteSave, notePlaceholder = 'Notiz hinzufügen…' }: EntryRowProps) {
  const isPause = kind === 'pause';
  const isEmpty = kind === 'empty';
  const noteEditable = onNoteSave !== undefined;
  const [noteEditing, setNoteEditing] = useState(false);
  const noteInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (noteEditing) noteInputRef.current?.focus();
  }, [noteEditing]);

  const rowStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '28px 1fr 200px 96px 60px 28px',
    gap: 12,
    padding: '0 18px',
    minHeight: isPause ? 36 : 56,
    alignItems: 'center',
    borderBottom: '1px solid var(--border-light)',
    transition: 'background 150ms ease',
    cursor: onClick ? 'pointer' : 'default',
    background: isPause ? 'var(--bg-secondary)' : 'transparent',
    opacity: isEmpty ? 0.55 : isPause ? 0.85 : 1,
  };

  const iconColor =
    kind === 'project' ? color ?? 'var(--accent-primary)'
    : kind === 'travel' ? 'var(--gewerk-buehne, #CC8844)'
    : kind === 'school' ? 'var(--gewerk-led, #7A8AB8)'
    : 'var(--text-tertiary)';

  const iconWrapStyle: CSSProperties = {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: iconColor,
    opacity: isEmpty ? 0.4 : 1,
  };

  const descStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
    justifyContent: 'center',
  };

  const labelStyle: CSSProperties = {
    fontSize: isPause ? 11 : 13,
    fontWeight: isPause ? 600 : 500,
    color: isEmpty ? 'var(--text-tertiary)' : isPause ? 'var(--text-tertiary)' : 'var(--text-primary)',
    fontStyle: isEmpty ? 'italic' : 'normal',
    textTransform: isPause ? 'uppercase' : 'none',
    letterSpacing: isPause ? '0.08em' : 'normal',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.3,
  };

  const sublabelStyle: CSSProperties = {
    fontSize: isPause ? 10 : 11,
    color: 'var(--text-tertiary)',
    fontStyle: isPause ? 'italic' : 'italic',
    opacity: isPause ? 0.85 : 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    lineHeight: 1.3,
  };

  const projStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'var(--font-mono)',
    fontSize: 11.5,
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    visibility: isPause ? 'hidden' : 'visible',
  };

  const spanStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 11.5,
    color: 'var(--text-secondary)',
  };

  const durStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: isPause ? 11 : 12,
    fontWeight: isPause ? 500 : 600,
    color: isPause ? 'var(--text-tertiary)' : 'var(--text-primary)',
    textAlign: 'right',
  };

  const menuStyle: CSSProperties = {
    color: 'var(--text-tertiary)',
    opacity: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 150ms ease',
  };

  return (
    <div
      style={rowStyle}
      className="cxl-entry-row"
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isPause && !isEmpty) {
          (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)';
        }
        const m = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('.cxl-entry-row-menu');
        if (m) m.style.opacity = '0.7';
        const n = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('.cxl-entry-row-note');
        if (n && !noteValue) n.style.opacity = '0.6';
      }}
      onMouseLeave={(e) => {
        if (!isPause) {
          (e.currentTarget as HTMLElement).style.background = isPause ? 'var(--bg-secondary)' : 'transparent';
        }
        const m = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('.cxl-entry-row-menu');
        if (m) m.style.opacity = '0';
        const n = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('.cxl-entry-row-note');
        if (n && !noteValue) n.style.opacity = '0';
      }}
    >
      <div style={iconWrapStyle}>{icon}</div>
      <div style={descStyle}>
        <div style={labelStyle}>{label}</div>
        {noteEditable ? (
          noteEditing ? (
            <input
              ref={noteInputRef}
              defaultValue={noteValue ?? ''}
              placeholder={notePlaceholder}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => {
                const v = e.currentTarget.value;
                if (v !== (noteValue ?? '')) onNoteSave!(v);
                setNoteEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                if (e.key === 'Escape') { setNoteEditing(false); }
              }}
              style={{
                ...sublabelStyle,
                background: 'var(--bg-input, var(--bg-secondary))',
                border: '1px solid var(--accent-primary)',
                borderRadius: 'var(--radius-sm, 8px)',
                padding: '2px 6px',
                fontStyle: 'normal',
                width: '100%',
                outline: 'none',
                color: 'var(--text-primary)',
              }}
            />
          ) : (
            <div
              style={{ ...sublabelStyle, cursor: 'text', opacity: noteValue ? 1 : 0 }}
              className="cxl-entry-row-note"
              onClick={(e) => { e.stopPropagation(); setNoteEditing(true); }}
            >
              {noteValue || notePlaceholder}
            </div>
          )
        ) : (
          sublabel && <div style={sublabelStyle}>{sublabel}</div>
        )}
      </div>
      <div style={projStyle}>
        {kind === 'project' && color && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: color,
              flexShrink: 0,
            }}
          />
        )}
        {proj}
      </div>
      <div style={spanStyle}>{span}</div>
      <div style={durStyle}>{duration}</div>
      <div className="cxl-entry-row-menu" style={menuStyle}>
        {menu}
      </div>
    </div>
  );
}
