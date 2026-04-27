// Status-Vokabular fuer cueplex (Single Source of Truth).
// crew + ops + invoices + power konsumieren ALLE diesen Satz.
// Wenn ein neuer Status dazukommt: HIER eintragen, sonst nirgendwo.

import type { CSSProperties } from 'react';
import { Pill } from '../data/DataPrimitives';

// Vereinigung aller Modul-spezifischen Status (crew + ops). Module nutzen ihre relevante Teilmenge.
export const STATUS_KEYS = [
  'anfrage',
  'planung',
  'bestaetigt',
  'aufbau',
  'show',
  'abbau',
  'aktiv',
  'abgerechnet',
  'abgeschlossen',
  'archiviert',
  'storniert',
] as const;

export type StatusKey = (typeof STATUS_KEYS)[number];

export const STATUS_LABELS: Record<StatusKey, string> = {
  anfrage: 'Anfrage',
  planung: 'Planung',
  bestaetigt: 'Bestätigt',
  aufbau: 'Aufbau',
  show: 'Show',
  abbau: 'Abbau',
  aktiv: 'Aktiv',
  abgerechnet: 'Abgerechnet',
  abgeschlossen: 'Abgeschlossen',
  archiviert: 'Archiviert',
  storniert: 'Storniert',
};

// CSS-Variablen-Referenzen (kein hardcoded Hex). Theme-Switch (light/dark/disco) greift automatisch.
export const STATUS_COLORS: Record<StatusKey, string> = {
  anfrage: 'var(--status-angefragt)',
  planung: 'var(--status-rueckfrage)',
  bestaetigt: 'var(--status-bestaetigt)',
  aufbau: 'var(--accent-primary)',
  show: 'var(--accent-primary)',
  abbau: 'var(--accent-primary)',
  aktiv: 'var(--status-bestaetigt)',
  abgerechnet: 'var(--text-tertiary)',
  abgeschlossen: 'var(--text-tertiary)',
  archiviert: 'var(--text-tertiary)',
  storniert: 'var(--status-abgelehnt)',
};

export const STATUS_BG: Record<StatusKey, string> = {
  anfrage: 'var(--status-angefragt-bg)',
  planung: 'var(--status-rueckfrage-bg, var(--bg-tertiary))',
  bestaetigt: 'var(--status-bestaetigt-bg)',
  aufbau: 'var(--status-bestaetigt-bg)',
  show: 'var(--status-bestaetigt-bg)',
  abbau: 'var(--status-bestaetigt-bg)',
  aktiv: 'var(--status-bestaetigt-bg)',
  abgerechnet: 'var(--bg-tertiary)',
  abgeschlossen: 'var(--bg-tertiary)',
  archiviert: 'var(--bg-tertiary)',
  storniert: 'var(--status-abgelehnt-bg)',
};

// Items mit diesen Status werden im Gantt/Listen optisch zurueckgesetzt (transparenter).
export const DIMMED_STATUSES: ReadonlyArray<StatusKey> = [
  'abgerechnet',
  'abgeschlossen',
  'archiviert',
  'storniert',
];

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
