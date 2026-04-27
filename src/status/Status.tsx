// Status-Vokabular fuer cueplex (Single Source of Truth).
// crew + ops + invoices + power konsumieren ALLE diesen Satz.
// Wenn ein neuer Status dazukommt: HIER eintragen, sonst nirgendwo.

import type { CSSProperties } from 'react';
import { Pill } from '../data/DataPrimitives';

export const STATUS_KEYS = [
  'anfrage',
  'planung',
  'bestaetigt',
  'aufbau',
  'aktiv',
  'abgeschlossen',
  'archiviert',
] as const;

export type StatusKey = (typeof STATUS_KEYS)[number];

export const STATUS_LABELS: Record<StatusKey, string> = {
  anfrage: 'Anfrage',
  planung: 'Planung',
  bestaetigt: 'Bestätigt',
  aufbau: 'Aufbau',
  aktiv: 'Aktiv',
  abgeschlossen: 'Abgeschlossen',
  archiviert: 'Archiviert',
};

// CSS-Variablen-Referenzen (kein hardcoded Hex). Theme-Switch (light/dark/disco) greift automatisch.
export const STATUS_COLORS: Record<StatusKey, string> = {
  anfrage: 'var(--status-angefragt)',
  planung: 'var(--status-rueckfrage)',
  bestaetigt: 'var(--status-bestaetigt)',
  aufbau: 'var(--status-bestaetigt)',
  aktiv: 'var(--status-bestaetigt)',
  abgeschlossen: 'var(--text-tertiary)',
  archiviert: 'var(--text-tertiary)',
};

export const STATUS_BG: Record<StatusKey, string> = {
  anfrage: 'var(--status-angefragt-bg)',
  planung: 'var(--status-rueckfrage-bg, var(--bg-tertiary))',
  bestaetigt: 'var(--status-bestaetigt-bg)',
  aufbau: 'var(--status-bestaetigt-bg)',
  aktiv: 'var(--status-bestaetigt-bg)',
  abgeschlossen: 'var(--bg-tertiary)',
  archiviert: 'var(--bg-tertiary)',
};

// Items mit diesen Status werden im Gantt/Listen optisch zurueckgesetzt (transparenter).
export const DIMMED_STATUSES: ReadonlyArray<StatusKey> = ['abgeschlossen', 'archiviert'];

export function isDimmedStatus(s: StatusKey | string | undefined | null): boolean {
  return !!s && (DIMMED_STATUSES as readonly string[]).includes(s);
}

// Convenience-Wrapper um Pill: zeigt status-Label mit korrekter Farbe.
export interface StatusPillProps {
  status: StatusKey;
  /** Optionaler Label-Override (z.B. fuer i18n) */
  label?: string;
}

export function StatusPill({ status, label }: StatusPillProps) {
  const style: CSSProperties = {
    background: STATUS_BG[status],
    color: STATUS_COLORS[status],
  };
  // Pill akzeptiert intent als preset — fuer custom CSS rendern wir einen eigenen span im selben Stil.
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 8px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 500,
        ...style,
      }}
    >
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}

// Backward-compat: erlaubt ad-hoc-Pill-Mapping fuer Konsumenten die noch Pill direkt nutzen.
export function statusToPillIntent(status: StatusKey): 'neutral' | 'warn' | 'success' | 'danger' | 'accent' {
  if (status === 'anfrage' || status === 'planung') return 'warn';
  if (status === 'bestaetigt' || status === 'aufbau' || status === 'aktiv') return 'success';
  return 'neutral';
}

// Re-export Pill so consumers can use it via this module too.
export { Pill };
