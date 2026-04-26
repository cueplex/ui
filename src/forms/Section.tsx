import { useState, type ReactNode, type CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Section — Card mit Header (Titel, Meta, Action-Slot, Chevron) und collapsible Body.
 * Theme-aware via CSS-vars, ID für Anchor-Navigation (Sub-Sidebar Scroll-Spy).
 * Pattern aus cueplex/ops Article-Detail (Iteration 6, 26.04.2026).
 */

export interface SectionProps {
  id?: string;
  title: string;
  meta?: string;
  action?: ReactNode;
  defaultCollapsed?: boolean;
  bodyPadding?: 'default' | 'none';
  children: ReactNode;
}

export function Section({
  id,
  title,
  meta,
  action,
  defaultCollapsed = false,
  bodyPadding = 'default',
  children,
}: SectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section id={id} style={sectionStyle}>
      <header
        style={{ ...headerStyle, borderBottom: collapsed ? 'none' : '1px solid var(--border-light)' }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-section-action]')) return;
          setCollapsed((c) => !c);
        }}
      >
        <h3 style={titleStyle}>{title}</h3>
        {meta && <span style={metaStyle}>{meta}</span>}
        {action && (
          <span data-section-action style={{ marginLeft: 'auto' }}>
            {action}
          </span>
        )}
        <ChevronDown
          size={14}
          aria-hidden
          style={{
            color: 'var(--text-tertiary)',
            marginLeft: action ? 12 : 'auto',
            transition: 'transform 150ms ease',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)',
          }}
        />
      </header>
      {!collapsed && (
        <div style={{ padding: bodyPadding === 'none' ? 0 : '16px 18px' }}>{children}</div>
      )}
    </section>
  );
}

const sectionStyle: CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-light)',
  borderRadius: 'var(--radius-md, 10px)',
  marginBottom: 16,
  overflow: 'hidden',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 18px',
  cursor: 'pointer',
  userSelect: 'none',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--text-primary)',
};

const metaStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--text-tertiary)',
  fontFamily: 'var(--font-mono)',
};
