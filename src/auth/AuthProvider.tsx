import { useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts';
import { AuthContext, type AuthContextValue } from './useAuth';

/**
 * SPA mode (default): OIDC + PKCE flow, browser-native.
 * Fuer standalone SPAs wie cueplex-ops.
 */
export interface SpaAuthConfig {
  mode?: 'spa';
  keycloakUrl: string;
  realm: string;
  clientId: string;
  redirectBasePath: string;
  scope?: string;
}

/**
 * Server mode: User wird server-side (via Express-Session + confidential Keycloak-Client)
 * bereitgestellt und an den Client gegeben (z.B. via window.__CUEPLEX_USER__).
 * Kein OIDC-Flow im Browser. Fuer crew, invoices, power.
 */
export interface ServerAuthConfig {
  mode: 'server';
  user: ServerAuthUser;
  /** URL for logout redirect (server handles session teardown). Default: '/auth/logout'. */
  logoutUrl?: string;
}

export interface ServerAuthUser {
  name?: string;
  preferred_username?: string;
  email?: string;
  sub?: string;
  [key: string]: unknown;
}

export type AuthConfig = SpaAuthConfig | ServerAuthConfig;

export interface AuthProviderProps {
  config: AuthConfig;
  children: ReactNode;
}

function ServerAuthProvider({ config, children }: { config: ServerAuthConfig; children: ReactNode }) {
  const value = useMemo<AuthContextValue>(() => {
    const mockUser = {
      profile: config.user,
      access_token: '',
      id_token: '',
      token_type: 'Bearer',
      scope: '',
      expires_at: 0,
      expired: false,
      state: null,
      session_state: null,
      refresh_token: '',
    } as unknown as User;
    return {
      user: mockUser,
      loading: false,
      error: null,
      login: async () => { /* no-op: server handles */ },
      logout: async () => {
        window.location.href = config.logoutUrl ?? '/auth/logout';
      },
      getAccessToken: async () => null,
    };
  }, [config.user, config.logoutUrl]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ config, children }: AuthProviderProps) {
  if (config.mode === 'server') {
    return <ServerAuthProvider config={config} children={children} />;
  }
  return <SpaAuthProvider config={config} children={children} />;
}

function SpaAuthProvider({ config, children }: { config: SpaAuthConfig; children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userManager = useMemo(() => {
    const appBase = `${window.location.origin}${config.redirectBasePath}`;
    return new UserManager({
      authority: `${config.keycloakUrl}/realms/${config.realm}`,
      client_id: config.clientId,
      redirect_uri: `${appBase}/auth/callback`,
      post_logout_redirect_uri: `${window.location.origin}/`,
      response_type: 'code',
      scope: config.scope ?? 'openid profile email',
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
    });
  }, [config.keycloakUrl, config.realm, config.clientId, config.redirectBasePath, config.scope]);

  const login = useCallback(async () => {
    await userManager.signinRedirect();
  }, [userManager]);

  const logout = useCallback(async () => {
    await userManager.signoutRedirect();
  }, [userManager]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const u = await userManager.getUser();
    if (!u || u.expired) return null;
    return u.access_token;
  }, [userManager]);

  useEffect(() => {
    const appBase = `${window.location.origin}${config.redirectBasePath}`;

    async function init() {
      try {
        const isCallback = window.location.pathname.endsWith(`${config.redirectBasePath}/auth/callback`)
          || window.location.search.includes('code=');

        if (isCallback) {
          try {
            const cbUser = await userManager.signinRedirectCallback();
            window.history.replaceState({}, document.title, `${appBase}/`);
            setUser(cbUser);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('[auth] signinRedirectCallback failed', err);
            // Stale-state Recovery: einmal versuchen, nicht in Endless-Loop laufen.
            // sessionStorage-Flag verhindert zweiten Versuch in derselben Session.
            const RECOVERY_FLAG = 'cx-oidc-recovery-attempted';
            const alreadyTried = sessionStorage.getItem(RECOVERY_FLAG) === '1';
            if (!alreadyTried && (msg.includes('No matching state') || msg.includes('state'))) {
              sessionStorage.setItem(RECOVERY_FLAG, '1');
              try {
                for (const key of Object.keys(localStorage)) {
                  if (key.startsWith('oidc.')) localStorage.removeItem(key);
                }
              } catch { /* ignore */ }
              // URL cleanen damit isCallback beim naechsten Load false ist
              window.history.replaceState({}, document.title, `${appBase}/`);
              await userManager.signinRedirect();
              return;
            }
            setError(alreadyTried
              ? 'Auth-Recovery bereits versucht. Bitte Browser-localStorage manuell leeren (DevTools → Application → Local Storage → alle oidc.* keys löschen) und F5.'
              : msg,
            );
          }
          setLoading(false);
          return;
        }

        const existing = await userManager.getUser();
        if (existing && !existing.expired) {
          setUser(existing);
          setLoading(false);
          return;
        }

        // No token -> login redirect
        await userManager.signinRedirect();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    }

    void init();

    const unsub = userManager.events.addUserLoaded((u) => setUser(u));
    return () => unsub();
  }, [userManager, config.redirectBasePath]);

  const value: AuthContextValue = useMemo(
    () => ({ user, loading, error, login, logout, getAccessToken }),
    [user, loading, error, login, logout, getAccessToken],
  );

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-primary)', background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Auth-Fehler</h2>
        <pre style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 16, whiteSpace: 'pre-wrap' }}>{error}</pre>
        <button onClick={() => location.reload()} style={{ marginTop: 16, padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
          Neu laden
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--bg-primary)', minHeight: '100vh', fontSize: 13 }}>
        Anmeldung laeuft...
      </div>
    );
  }

  if (!user) {
    return (
      <AuthContext.Provider value={value}>
        <div style={{ padding: 40, color: 'var(--text-tertiary)' }}>
          Keine Session — <button onClick={() => void login()}>Anmelden</button>
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
