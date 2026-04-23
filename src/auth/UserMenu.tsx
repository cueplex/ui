import { useEffect, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import type { User } from 'oidc-client-ts';
import { useAuth, userDisplayName } from './useAuth';

// Initialen aus Name oder Email ableiten.
// "Patrick Scharf" -> "PS", "patti@gmx.de" -> "P"
function getInitials(user: User): string {
  const p = user.profile;
  const name = (p.name as string) || (p.preferred_username as string) || (p.email as string) || '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 1).toUpperCase();
}

function getSecondaryInfo(user: User): string | null {
  const p = user.profile;
  const email = p.email as string | undefined;
  const name = p.name as string | undefined;
  if (email && name && email !== name) return email;
  return null;
}

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) return null;

  const initials = getInitials(user);
  const displayName = userDisplayName(user);
  const secondary = getSecondaryInfo(user);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title={displayName}
        style={{
          width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
          border: '1px solid var(--border-light)',
          background: 'transparent',
          color: 'var(--text-tertiary)',
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1,
          paddingTop: 1,
          cursor: 'pointer',
          transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = 'var(--border-light)';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }
        }}
      >
        {initials}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%', right: 0,
            marginTop: 6,
            minWidth: 220,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md, 10px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {displayName}
            </div>
            {secondary && (
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1.3 }}>
                {secondary}
              </div>
            )}
          </div>
          <button
            onClick={() => { setOpen(false); void logout(); }}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 13,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.12s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <LogOut size={15} />
            Abmelden
          </button>
        </div>
      )}
    </div>
  );
}
