import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../theme/useTheme';
import { CxLogoTextIcon, CxLogoIcon } from './CxLogo';

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface SidebarProps {
  navSections: NavSection[];
  moduleName: string;
  moduleVersion: string;
  onSettingsClick?: () => void;
}

export function Sidebar({ navSections, moduleName, moduleVersion, onSettingsClick }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useTheme();
  const location = useLocation();
  const isActive = (to: string) => location.pathname === to;

  const navBtnStyle = (active: boolean, disabled?: boolean): React.CSSProperties => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    background: active ? 'var(--bg-tertiary)' : 'transparent',
    color: disabled
      ? 'var(--text-tertiary)'
      : active
        ? 'var(--text-primary)'
        : 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background var(--transition-fast), color var(--transition-fast)',
    opacity: disabled ? 0.5 : 1,
    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
    textDecoration: 'none',
  });

  return (
    <aside
      style={{
        width: sidebarCollapsed ? 56 : 'var(--sidebar-width, 260px)',
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
      {/* Logo-Header — cueplex-launcher.js bindet sich an data-cxl-trigger */}
      <div
        data-cxl-trigger=""
        title="Engine wechseln"
        style={{
          padding: sidebarCollapsed ? '16px 0' : '16px 20px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          gap: 9,
          minHeight: 56,
          color: 'var(--text-primary)',
          cursor: 'pointer',
        }}
      >
        {sidebarCollapsed ? (
          <CxLogoIcon size={24} />
        ) : (
          <>
            <CxLogoTextIcon height={20} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: 400 }}>
              {moduleName}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', fontWeight: 400, opacity: 0.6 }}>
              v{moduleVersion}
            </span>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto' }}>
        {navSections.map((section) => (
          <div key={section.label}>
            {!sidebarCollapsed && (
              <div style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-tertiary)',
                padding: '16px 12px 4px',
                fontWeight: 600,
              }}>
                {section.label}
              </div>
            )}
            {sidebarCollapsed && (
              <div style={{ margin: '8px 0', borderBottom: '1px solid var(--border-light)' }} />
            )}
            {section.items.map((item) =>
              item.disabled ? (
                <div key={item.to} style={navBtnStyle(false, true)} title={sidebarCollapsed ? item.label : undefined}>
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {!sidebarCollapsed && (
                    <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>Bald</span>
                  )}
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  style={navBtnStyle(isActive(item.to))}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              )
            )}
          </div>
        ))}
      </nav>

      {/* Settings + Collapse */}
      <div style={{ padding: 8, borderTop: '1px solid var(--border-light)' }}>
        <button
          title={sidebarCollapsed ? 'Einstellungen' : undefined}
          onClick={onSettingsClick}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: 13,
            cursor: 'pointer',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}
        >
          <Settings size={18} />
          {!sidebarCollapsed && <span>Einstellungen</span>}
        </button>
        <button
          onClick={toggleSidebar}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            marginTop: 4,
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
