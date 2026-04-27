// Inspector — generischer Slide-Out Drawer fuer Detail-Ansichten.
// Ersetzt crew/EventDetailPanel + ops inline-drawer + bauzeitenplan/InspectorPanel + briefing/InspectorPanel.
//
// Pattern: header (slot) + tabs (optional) + sections (slot/children). Schliesst mit ESC + Backdrop-Klick.

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';

export interface InspectorTab {
  id: string;
  label: string;
  badge?: number | string;
}

export interface InspectorProps {
  open: boolean;
  onClose: () => void;
  /** Header-Inhalt (oben links) — typischerweise Title + Subtitle */
  header?: ReactNode;
  /** Optional: Header-Aktionen rechts (Buttons, Menu) */
  headerActions?: ReactNode;
  /** Optional: Tabs */
  tabs?: InspectorTab[];
  activeTabId?: string;
  onTabChange?: (id: string) => void;
  /** Body-Inhalt — Sections oder Tab-Content */
  children: ReactNode;
  /** Optional: Footer (z.B. Speichern/Abbrechen) */
  footer?: ReactNode;
  /** Breite des Drawers */
  width?: number | string;
  /** Klick auf Backdrop schliesst */
  closeOnBackdrop?: boolean;
}

export function Inspector({
  open,
  onClose,
  header,
  headerActions,
  tabs,
  activeTabId,
  onTabChange,
  children,
  footer,
  width = 480,
  closeOnBackdrop = true,
}: InspectorProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const backdropStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 998,
    animation: 'cuixFadeIn 150ms ease',
  };

  const drawerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width,
    maxWidth: '100vw',
    background: 'var(--bg-secondary)',
    borderLeft: '1px solid var(--border-default)',
    boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-sans)',
    color: 'var(--text-primary)',
    animation: 'cuixSlideIn 200ms ease',
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: 'var(--space-lg, 24px) var(--space-lg, 24px) var(--space-md, 16px)',
    borderBottom: '1px solid var(--border-light)',
  };

  const tabsStyle: CSSProperties = {
    display: 'flex',
    gap: 4,
    padding: '0 var(--space-lg, 24px)',
    borderBottom: '1px solid var(--border-light)',
    overflowX: 'auto',
  };

  const bodyStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--space-lg, 24px)',
  };

  const footerStyle: CSSProperties = {
    padding: 'var(--space-md, 16px) var(--space-lg, 24px)',
    borderTop: '1px solid var(--border-light)',
    background: 'var(--bg-primary)',
  };

  return (
    <>
      <style>{`
        @keyframes cuixFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cuixSlideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .cuix-tab { padding: 8px 14px; cursor: pointer; font-size: var(--font-size-body, 13px); color: var(--text-secondary); border-bottom: 2px solid transparent; white-space: nowrap; }
        .cuix-tab:hover { color: var(--text-primary); }
        .cuix-tab.is-active { color: var(--text-primary); border-bottom-color: var(--accent-primary); }
        .cuix-tab-badge { display: inline-block; margin-left: 6px; padding: 0 6px; min-width: 16px; text-align: center; border-radius: 9999px; background: var(--bg-tertiary); color: var(--text-secondary); font-size: var(--font-size-xs, 10px); font-weight: 600; }
      `}</style>

      <div
        style={backdropStyle}
        onClick={() => closeOnBackdrop && onClose()}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        style={drawerStyle}
        role="dialog"
        aria-modal="true"
      >
        <div style={headerStyle}>
          <div style={{ flex: 1, minWidth: 0 }}>{header}</div>
          {headerActions}
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 'var(--radius-sm, 8px)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {tabs && tabs.length > 0 && (
          <div style={tabsStyle}>
            {tabs.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => onTabChange?.(t.id)}
                className={'cuix-tab' + (t.id === activeTabId ? ' is-active' : '')}
                style={{ background: 'transparent', border: 'none' }}
              >
                {t.label}
                {t.badge !== undefined && <span className="cuix-tab-badge">{t.badge}</span>}
              </button>
            ))}
          </div>
        )}

        <div style={bodyStyle}>{children}</div>

        {footer && <div style={footerStyle}>{footer}</div>}
      </div>
    </>
  );
}

// ─── InspectorSection — semantischer Block im Inspector-Body ─────
export interface InspectorSectionProps {
  title?: string;
  /** Optional: Action-Button rechts in der Section-Header-Zeile */
  action?: ReactNode;
  children: ReactNode;
}

export function InspectorSection({ title, action, children }: InspectorSectionProps) {
  return (
    <section style={{ marginBottom: 'var(--space-xl, 32px)' }}>
      {(title || action) && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-sm, 8px)',
            paddingBottom: 'var(--space-sm, 8px)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          {title && (
            <h3
              style={{
                fontSize: 'var(--font-size-xs, 10px)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

// ─── InspectorRow — Key/Value-Zeile (Label links, Value rechts) ───
export interface InspectorRowProps {
  label: string;
  value?: ReactNode;
  /** Wenn value falsy ist, wird "—" angezeigt */
  placeholder?: string;
}

export function InspectorRow({ label, value, placeholder = '—' }: InspectorRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 12,
        padding: '6px 0',
        fontSize: 'var(--font-size-body, 13px)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <span
        style={{
          flex: '0 0 130px',
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-size-sm, 11px)',
        }}
      >
        {label}
      </span>
      <span style={{ flex: 1, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
        {value ?? <span style={{ color: 'var(--text-tertiary)' }}>{placeholder}</span>}
      </span>
    </div>
  );
}
