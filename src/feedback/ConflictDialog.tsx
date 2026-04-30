// ConflictDialog — Side-by-Side-Diff Dialog fuer Optimistic-Lock-Konflikt (HTTP 409).
//
// Zeigt links Server-Version (mit "von $userName"), rechts eigene Aenderung.
// Buttons: "Server uebernehmen" | "Meine Aenderung erzwingen" | optional "Mergen".
//
// Visuell Token-konform:
//   - Backdrop blur + dim
//   - Card: bg-card, border-default, radius-lg
//   - Buttons via @cueplex/ui Button-Primitive
//
// Verwendung typischerweise via useOptimisticUpdate-Hook (returnt das Dialog-JSX).
// Direkt-Verwendung moeglich: Props open/onClose/etc. controlled.

import { useEffect, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../forms/Button';

export interface ConflictDialogProps<T = unknown> {
  open: boolean;
  /** Aktueller Server-Stand (was jemand anders zwischendurch geschrieben hat). */
  currentValue: T;
  /** Eigene unbestaetigte Aenderung. */
  yourValue: T;
  /** Wer hat zwischenzeitlich geschrieben? */
  currentUser?: { id?: string; display?: string } | null;
  /** Wann wurde es geaendert? Default: jetzt - keine Angabe. */
  changedAtRelative?: string;
  /** Custom Renderer fuer einen Wert (Server bzw. eigene Version). */
  renderValue?: (value: T, side: 'server' | 'mine') => ReactNode;
  /** "Server uebernehmen" Klick — verwirft eigene Aenderung. */
  onTakeServer: () => void;
  /** "Meine Aenderung erzwingen" Klick — Caller sollte mit aktuellem ETag retry'en. */
  onTakeMine: () => void;
  /** Optional: 3. Button fuer Merge. */
  onMerge?: () => void;
  onClose: () => void;
  /** Custom Title. Default: "Konflikt — gleichzeitige Aenderung". */
  title?: string;
}

export function ConflictDialog<T = unknown>({
  open,
  currentValue,
  yourValue,
  currentUser,
  changedAtRelative,
  renderValue,
  onTakeServer,
  onTakeMine,
  onMerge,
  onClose,
  title = 'Konflikt — gleichzeitige Aenderung',
}: ConflictDialogProps<T>) {
  // ESC schliesst
  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const userLabel = currentUser?.display || currentUser?.id || 'einem anderen Nutzer';
  const whenLabel = changedAtRelative ? `, ${changedAtRelative}` : '';

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={backdropStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={cardStyle}>
        <header style={headerStyle}>
          <div>
            <div style={titleStyle}>{title}</div>
            <div style={subtitleStyle}>
              Diese Daten wurden zwischenzeitlich von <strong>{userLabel}</strong>{whenLabel} geaendert.
              Was moechtest du tun?
            </div>
          </div>
        </header>

        <div style={columnsStyle}>
          <section style={columnStyle}>
            <div style={columnHeaderStyle}>Server-Version (von {userLabel})</div>
            <div style={valueBoxStyle}>
              {renderValue ? renderValue(currentValue, 'server') : <DefaultValue value={currentValue} />}
            </div>
          </section>
          <section style={columnStyle}>
            <div style={columnHeaderStyle}>Deine Aenderung</div>
            <div style={valueBoxStyle}>
              {renderValue ? renderValue(yourValue, 'mine') : <DefaultValue value={yourValue} />}
            </div>
          </section>
        </div>

        <footer style={footerStyle}>
          <Button variant="ghost" onClick={onClose}>
            Abbrechen
          </Button>
          <div style={{ flex: 1 }} />
          <Button variant="secondary" onClick={onTakeServer}>
            Server uebernehmen
          </Button>
          {onMerge && (
            <Button variant="secondary" onClick={onMerge}>
              Mergen
            </Button>
          )}
          <Button variant="primary" onClick={onTakeMine}>
            Meine Aenderung erzwingen
          </Button>
        </footer>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

function DefaultValue({ value }: { value: unknown }) {
  if (value == null) {
    return <span style={{ color: 'var(--text-tertiary)' }}>(leer)</span>;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return <span>{String(value)}</span>;
  }
  return (
    <pre
      style={{
        margin: 0,
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        fontSize: 12,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: 'var(--text-primary)',
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(8, 10, 14, 0.55)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 600,
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-lg, 14px)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
  overflow: 'hidden',
};

const headerStyle: CSSProperties = {
  padding: '18px 20px 12px',
  borderBottom: '1px solid var(--border-default)',
};

const titleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: 4,
};

const subtitleStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
};

const columnsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  padding: 16,
  overflow: 'auto',
};

const columnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  minWidth: 0,
};

const columnHeaderStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--text-tertiary)',
};

const valueBoxStyle: CSSProperties = {
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border-subtle, var(--border-default))',
  borderRadius: 'var(--radius-sm, 8px)',
  padding: 10,
  fontSize: 13,
  color: 'var(--text-primary)',
  minHeight: 60,
  overflow: 'auto',
};

const footerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 16px',
  borderTop: '1px solid var(--border-default)',
  background: 'var(--bg-secondary, var(--bg-card))',
};
