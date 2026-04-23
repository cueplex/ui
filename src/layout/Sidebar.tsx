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

const SIDEBAR_WIDTH = 224;
const SIDEBAR_COLLAPSED_WIDTH = 56;
const HEADER_HEIGHT = 52;

export function Sidebar({ navSections, moduleName, moduleVersion, onSettingsClick }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useTheme();
  const location = useLocation();
  const isActive = (to: string) => location.pathname === to;

  const navBtnStyle = (active: boolean, disabled?: boolean): React.CSSProperties => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 10px',
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
        width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
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
      {/* Logo-Header — exakte Header-Hoehe (52px), keine Padding-Disparitaet */}
      <div
        data-cxl-trigger=""
        title="Engine wechseln"
        style={{
          height: HEADER_HEIGHT,
          padding: sidebarCollapsed ? 0 : '0 16px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          gap: 8,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {sidebarCollapsed ? (
          <CxLogoIcon size={22} />
        ) : (
          <>
            <CxLogoTextIcon height={18} />
            <span style={{
              fontSize: 12,
              lineHeight: 1,
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              fontWeight: 400,
            }}>
              {moduleName}
            </span>
            <span style={{
              fontSize: 10,
              lineHeight: 1,
              color: 'var(--text-tertiary)',
              whiteSpace: 'nowrap',
              fontWeight: 400,
              opacity: 0.6,
              marginLeft: 'auto',
            }}>
              v{moduleVersion}
            </span>
          </>
        )}
      </div>

      {/* Navigation — keine Scrollbar sichtbar (Pattern-Regel cueplex-ci) */}
      <nav
        className="cxl-hide-scrollbar"
        style={{ flex: 1, padding: '0 6px', overflowY: 'auto' }}
      >
        {navSections.map((section) => (
          <div key={section.label}>
            {!sidebarCollapsed && (
              <div style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-tertiary)',
                padding: '14px 10px 4px',
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

      {/* Footer: Settings + Collapse. Collapse rechts statt mittig. */}
      <div style={{
        padding: 6,
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        <button
          title={sidebarCollapsed ? 'Einstellungen' : undefined}
          onClick={onSettingsClick}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px',
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
        <div style={{
          display: 'flex',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-end',
          padding: sidebarCollapsed ? 0 : '0 4px',
        }}>
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Seitenleiste ausklappen' : 'Seitenleiste einklappen'}
            style={{
              width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              transition: 'background 0.15s ease, color 0.15s ease',
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
      </div>
    </aside>
  );
}
