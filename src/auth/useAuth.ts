import { createContext, useContext } from 'react';
import type { User } from 'oidc-client-ts';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() must be used inside <AuthProvider>');
  }
  return ctx;
}

export function userDisplayName(user: User | null): string {
  if (!user) return '';
  const p = user.profile;
  return (p.name as string) || (p.preferred_username as string) || (p.email as string) || 'User';
}
