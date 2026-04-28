// Status-Vokabular fuer cueplex (Single Source of Truth).
// crew + ops + invoices + power konsumieren ALLE diesen Satz.
// Wenn ein neuer Status dazukommt: HIER eintragen, sonst nirgendwo.

import type { CSSProperties } from 'react';
import { Pill } from '../data/DataPrimitives';

// Vereinigung aller Modul-spezifischen Status (crew + ops). Module nutzen ihre relevante Teilmenge.
// 28.04.2026: aufbau/show/abbau zu 'veranstaltung' zusammengelegt, abgerechnet/aktiv/archiviert
// raus (zu abgeschlossen). Neu: 'packen' zwischen bestaetigt und veranstaltung.
export const STATUS_KEYS = [
  'anfrage',
  'planung',
  'bestaetigt',
  'packen',
  'veranstaltung',
  'abgeschlossen',
  'storniert',
] as const;

export type StatusKey = (typeof STATUS_KEYS)[number];

export const STATUS_LABELS: Record<StatusKey, string> = {
  anfrage: 'Anfrage',
  planung: 'Planung',
  bestaetigt: 'Bestätigt',
  packen: 'Packen',
  veranstaltung: 'Veranstaltung',
  abgeschlossen: 'Abgeschlossen',
  storniert: 'Storniert',
};

// CSS-Variablen-Referenzen (kein hardcoded Hex). Theme-Switch (light/dark/disco) greift automatisch.
// 28.04.2026 Patrick: packen=orange, veranstaltung=helleres grün.
// 'angefragt' ist warmes Amber/Gold — paßt für „Packen" (in-progress, achten!).
// 'bestaetigt' ist standard sage-green — wir nehmen status-bestaetigt-soft für veranstaltung
// (etwas heller via STATUS_BG-Token-Pattern, falls nicht: explicit lighter green).
export const STATUS_COLORS: Record<StatusKey, string> = {
  anfrage: 'var(--status-angefragt)',
  planung: 'var(--status-rueckfrage)',
  bestaetigt: 'var(--status-bestaetigt)',
  packen: 'var(--status-angefragt)',          // orange/amber
  veranstaltung: 'var(--status-veranstaltung)', // helleres Grün — Token unten ergänzt
  abgeschlossen: 'var(--text-tertiary)',
  storniert: 'var(--status-abgelehnt)',
};

export const STATUS_BG: Record<StatusKey, string> = {
  anfrage: 'var(--status-angefragt-bg)',
  planung: 'var(--status-rueckfrage-bg, var(--bg-tertiary))',
  bestaetigt: 'var(--status-bestaetigt-bg)',
  packen: 'var(--status-angefragt-bg)',
  veranstaltung: 'var(--status-veranstaltung-bg)',
  abgeschlossen: 'var(--bg-tertiary)',
  storniert: 'var(--status-abgelehnt-bg)',
};

// Items mit diesen Status werden im Gantt/Listen optisch zurueckgesetzt (transparenter).
export const DIMMED_STATUSES: ReadonlyArray<StatusKey> = [
  'abgeschlossen',
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
  if (status === 'anfrage' || status === 'planung' || status === 'packen') return 'warn';
  if (status === 'bestaetigt' || status === 'veranstaltung') return 'success';
  if (status === 'storniert') return 'danger';
  return 'neutral';
}

// Re-export Pill so consumers can use it via this module too.
export { Pill };
