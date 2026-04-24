import type { ReactNode, CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../theme/useTheme';
import { CxLogoTextIcon, CxLogoIcon } from './CxLogo';
import { Tooltip } from '../feedback/Tooltip';

export interface SidebarShellProps {
  children: ReactNode;
}

export function SidebarShell({ children }: SidebarShellProps) {
  const { sidebarCollapsed } = useTheme();
  return (
    <aside
      style={{
        width: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-normal)',
        overflow: 'hidden',
        flexShrink: 0,
        height: '100vh',
      }}
    >
      {children}
    </aside>
  );
}

export interface SidebarLogoProps {
  moduleName: string;
  moduleVersion: string;
  title?: string;
}

export function SidebarLogo({ moduleName, moduleVersion, title = 'Engine wechseln' }: SidebarLogoProps) {
  const { sidebarCollapsed } = useTheme();
  return (
    <div
      data-cxl-trigger=""
      title={title}
      style={{
        height: 'var(--header-height)',
        padding: sidebarCollapsed ? 0 : '0 var(--sidebar-logo-padding-x)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
        gap: 'var(--sidebar-logo-gap)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {sidebarCollapsed ? (
        <CxLogoIcon size={24} />
      ) : (
        <>
          <CxLogoTextIcon height={22} />
          <span style={{
            fontSize: 'var(--font-size-sm)',
            lineHeight: 1,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            fontWeight: 'var(--font-weight-normal)',
          }}>
            {moduleName}
          </span>
          <span style={{
            fontSize: 'var(--font-size-xs)',
            lineHeight: 1,
            color: 'var(--text-tertiary)',
            whiteSpace: 'nowrap',
            fontWeight: 'var(--font-weight-normal)',
            opacity: 0.6,
            marginLeft: 'auto',
          }}>
            v{moduleVersion}
          </span>
        </>
      )}
    </div>
  );
}

export interface SidebarNavProps {
  children: ReactNode;
}

export function SidebarNav({ children }: SidebarNavProps) {
  return (
    <nav className="cxl-hide-scrollbar" style={{ flex: 1, padding: '0 6px', overflowY: 'auto' }}>
      {children}
    </nav>
  );
}

export interface SidebarSectionProps {
  label: string;
  children: ReactNode;
}

export function SidebarSection({ label, children }: SidebarSectionProps) {
  const { sidebarCollapsed } = useTheme();
  return (
    <div>
      {sidebarCollapsed ? (
        <div style={{ margin: '8px 0', borderBottom: '1px solid var(--border-light)' }} />
      ) : (
        <div style={{
          fontSize: 'var(--font-size-xs)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-tertiary)',
          padding: '14px 10px 4px',
          fontWeight: 'var(--font-weight-semibold)',
        }}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

export interface SidebarItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  badge?: ReactNode;
}

export function SidebarItem({ to, icon, label, disabled, badge }: SidebarItemProps) {
  const { sidebarCollapsed } = useTheme();
  const location = useLocation();
  const active = location.pathname === to;

  const baseStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--sidebar-item-gap)',
    padding: 'var(--sidebar-item-padding-y) var(--sidebar-item-padding-x)',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    background: active ? 'var(--bg-tertiary)' : 'transparent',
    color: disabled
      ? 'var(--text-tertiary)'
      : active
        ? 'var(--text-primary)'
        : 'var(--text-secondary)',
    fontSize: 'var(--font-size-body)',
    fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background var(--transition-fast), color var(--transition-fast)',
    opacity: disabled ? 0.5 : 1,
    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
    textDecoration: 'none',
  };

  const inner = disabled ? (
    <div style={baseStyle}>
      {icon}
      {!sidebarCollapsed && <span>{label}</span>}
      {!sidebarCollapsed && badge !== undefined && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{badge}</span>
      )}
      {!sidebarCollapsed && badge === undefined && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>Bald</span>
      )}
    </div>
  ) : (
    <Link to={to} style={baseStyle}>
      {icon}
      {!sidebarCollapsed && <span>{label}</span>}
      {!sidebarCollapsed && badge !== undefined && (
        <span style={{ marginLeft: 'auto' }}>{badge}</span>
      )}
    </Link>
  );

  // Im collapsed-Modus zeigen wir Label via Tooltip rechts neben dem Icon.
  return sidebarCollapsed ? (
    <Tooltip text={label}>{inner}</Tooltip>
  ) : inner;
}

export interface SidebarFooterProps {
  children: ReactNode;
}

export function SidebarFooter({ children }: SidebarFooterProps) {
  return (
    <div style={{
      padding: 6,
      borderTop: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      {children}
    </div>
  );
}

export interface SidebarSettingsButtonProps {
  onClick?: () => void;
  label?: string;
}

export function SidebarSettingsButton({ onClick, label = 'Einstellungen' }: SidebarSettingsButtonProps) {
  const { sidebarCollapsed } = useTheme();
  const btn = (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 'var(--sidebar-item-gap)',
        padding: 'var(--sidebar-item-padding-y) var(--sidebar-item-padding-x)',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: 'transparent',
        color: 'var(--text-secondary)',
        fontSize: 'var(--font-size-body)',
        cursor: 'pointer',
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
      }}
    >
      <Settings size={18} />
      {!sidebarCollapsed && <span>{label}</span>}
    </button>
  );
  return sidebarCollapsed ? <Tooltip text={label}>{btn}</Tooltip> : btn;
}

export function SidebarCollapseButton() {
  const { sidebarCollapsed, toggleSidebar } = useTheme();
  return (
    <div style={{
      display: 'flex',
      justifyContent: sidebarCollapsed ? 'center' : 'flex-end',
      padding: sidebarCollapsed ? 0 : '0 4px',
    }}>
      <button
        onClick={toggleSidebar}
        title={sidebarCollapsed ? 'Seitenleiste ausklappen' : 'Seitenleiste einklappen'}
        style={{
          width: 'var(--collapse-button-size)',
          height: 'var(--collapse-button-size)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: 'transparent',
          color: 'var(--text-tertiary)',
          cursor: 'pointer',
          transition: 'background var(--transition-fast), color var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-tertiary)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-tertiary)';
        }}
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );
}
