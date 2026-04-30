// useOptimisticUpdate — Hook fuer Optimistic-Locking (If-Match / 409 Konflikt-Handling).
//
// Pattern:
//   const { mutate, conflictDialog, etag, isLoading } = useOptimisticUpdate(
//     async (currentEtag) => {
//       const res = await fetch('/api/shifts/123', {
//         method: 'PATCH',
//         headers: { 'If-Match': currentEtag ? `"${currentEtag}"` : '', 'Content-Type': 'application/json' },
//         body: JSON.stringify(myData),
//       });
//       if (res.status === 409) {
//         const body = await res.json();
//         throw new ConflictError(body.currentValue, body.currentUser);
//       }
//       const newEtag = res.headers.get('ETag')?.replace(/^"(.*)"$/, '$1') ?? undefined;
//       return { etag: newEtag, data: await res.json() };
//     },
//     {
//       onConflict: (current, mine) => console.log('conflict', current, mine),
//       onSuccess:  (data) => toast.success('Gespeichert'),
//     }
//   );
//
//   <button onClick={() => mutate(myValue)}>Speichern</button>
//   {conflictDialog}
//
// Backend-Vertrag (siehe @cueplex/api-utils/optimistic-lock):
//   - 200 + ETag-Header bei Erfolg
//   - 409 application/problem+json mit { currentValue, currentVersion, currentUser } bei Mismatch
//   - 428 wenn If-Match fehlt (sollte hier nicht passieren — Hook sendet immer mit, falls etag bekannt)

import { useCallback, useState, type ReactNode } from 'react';
import { ConflictDialog } from '../feedback/ConflictDialog';

export class ConflictError<T = unknown> extends Error {
  status = 409;
  constructor(
    public currentValue: T,
    public currentUser?: { id?: string; display?: string } | null,
    public currentVersion?: string,
  ) {
    super('version_mismatch');
    this.name = 'ConflictError';
  }
}

export interface OptimisticUpdateResult<T> {
  etag?: string;
  data: T;
}

export interface UseOptimisticUpdateOptions<T, V = T> {
  /** Initial-ETag (z.B. aus letztem GET) */
  initialEtag?: string;
  /** Callback bei 409 — bekommt server-version + eigene Version. Hook zeigt Dialog ohnehin selbst. */
  onConflict?: (current: T, mine: V) => void;
  /** Callback bei Erfolg */
  onSuccess?: (data: T) => void;
  /** Callback bei sonstigen Fehlern */
  onError?: (err: unknown) => void;
  /** Custom Render fuer den Dialog. Default: <ConflictDialog/>. */
  renderConflictDialog?: (props: {
    current: T;
    mine: V;
    currentUser?: { id?: string; display?: string } | null;
    onTakeServer: () => void;
    onTakeMine: () => void;
    onClose: () => void;
  }) => ReactNode;
}

export interface UseOptimisticUpdateApi<T, V = T> {
  /** Fuehrt mutationFn aus. Bei 409: Dialog zeigen, Promise resolved erst nach User-Wahl. */
  mutate: (value: V) => Promise<T | undefined>;
  /** JSX-Slot — null wenn kein Konflikt aktiv ist. */
  conflictDialog: ReactNode | null;
  /** Aktueller ETag (aus letztem Erfolg). */
  etag: string | undefined;
  /** Mutation laeuft. */
  isLoading: boolean;
  /** Letzter Fehler (nicht-409). */
  error: unknown;
  /** Manuell ETag setzen (z.B. nach initialem GET). */
  setEtag: (etag: string | undefined) => void;
  /** Aktiven Conflict-Dialog manuell schliessen. */
  dismissConflict: () => void;
}

export function useOptimisticUpdate<T, V = T>(
  mutationFn: (currentEtag: string | undefined, value: V) => Promise<OptimisticUpdateResult<T>>,
  options: UseOptimisticUpdateOptions<T, V> = {},
): UseOptimisticUpdateApi<T, V> {
  const [etag, setEtag] = useState<string | undefined>(options.initialEtag);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [conflict, setConflict] = useState<{
    current: T;
    mine: V;
    currentUser?: { id?: string; display?: string } | null;
  } | null>(null);

  const dismissConflict = useCallback(() => setConflict(null), []);

  const mutate = useCallback(
    async (value: V): Promise<T | undefined> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await mutationFn(etag, value);
        setEtag(result.etag);
        options.onSuccess?.(result.data);
        return result.data;
      } catch (err) {
        if (err instanceof ConflictError) {
          const cu = err.currentUser ?? null;
          setConflict({ current: err.currentValue as T, mine: value, currentUser: cu });
          options.onConflict?.(err.currentValue as T, value);
          // Update etag to server version so a subsequent "take mine" sends the right If-Match
          if (err.currentVersion) setEtag(err.currentVersion);
          return undefined;
        }
        setError(err);
        options.onError?.(err);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, etag, options],
  );

  const onTakeServer = useCallback(() => {
    if (!conflict) return;
    options.onSuccess?.(conflict.current);
    setConflict(null);
  }, [conflict, options]);

  const onTakeMine = useCallback(() => {
    if (!conflict) return;
    const mine = conflict.mine;
    setConflict(null);
    void mutate(mine); // re-try mit jetzt aktuellem etag (server-version aus 409)
  }, [conflict, mutate]);

  let conflictDialog: ReactNode | null = null;
  if (conflict) {
    if (options.renderConflictDialog) {
      conflictDialog = options.renderConflictDialog({
        current: conflict.current,
        mine: conflict.mine,
        currentUser: conflict.currentUser,
        onTakeServer,
        onTakeMine,
        onClose: dismissConflict,
      });
    } else {
      conflictDialog = (
        <ConflictDialog<unknown>
          open
          currentValue={conflict.current as unknown}
          yourValue={conflict.mine as unknown}
          currentUser={conflict.currentUser ?? undefined}
          onTakeServer={onTakeServer}
          onTakeMine={onTakeMine}
          onClose={dismissConflict}
        />
      );
    }
  }

  return {
    mutate,
    conflictDialog,
    etag,
    isLoading,
    error,
    setEtag,
    dismissConflict,
  };
}
