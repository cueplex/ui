import { useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts';
import { AuthContext, type AuthContextValue } from './useAuth';

export interface AuthConfig {
  /** Keycloak base URL, e.g. 'https://auth.cueplex.app' */
  keycloakUrl: string;
  /** Keycloak realm, e.g. 'zeusaudio' */
  realm: string;
  /** OIDC client id, e.g. 'cueplex-ui' */
  clientId: string;
  /** Base path under window.location.origin, e.g. '/ops'. Callback is `${origin}${redirectBasePath}/auth/callback`. */
  redirectBasePath: string;
  /** OIDC scope, defaults to 'openid profile email'. */
  scope?: string;
}

export interface AuthProviderProps {
  config: AuthConfig;
  children: ReactNode;
}

export function AuthProvider({ config, children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userManager = useMemo(() => {
    const appBase = `${window.location.origin}${config.redirectBasePath}`;
    return new UserManager({
      authority: `${config.keycloakUrl}/realms/${config.realm}`,
      client_id: config.clientId,
      redirect_uri: `${appBase}/auth/callback`,
      post_logout_redirect_uri: `${appBase}/`,
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
            console.error('[auth] signinRedirectCallback failed', err);
            setError(err instanceof Error ? err.message : String(err));
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
