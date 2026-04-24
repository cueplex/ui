import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

/**
 * Generische Form-Controls als shared @cueplex/ui Komponenten.
 * Theme-aware via CSS-vars, kein hardcoded Styling.
 * Nutzung: ops Manufacturers/Articles/Cases (Patrick-approved Pattern, Sprint 1).
 */

// ─── FormField (Wrapper mit Label) ────────────────────

export interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, required, hint, error, children }: FormFieldProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
      <span style={{ color: 'var(--text-secondary)' }}>
        {label}{required && ' *'}
      </span>
      {children}
      {hint && !error && (
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{hint}</span>
      )}
      {error && (
        <span style={{ fontSize: 11, color: 'var(--status-abgelehnt)' }}>{error}</span>
      )}
    </label>
  );
}

// ─── FormInput ─────────────────────────────────────────

export interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
  error?: string;
}

export function FormInput({ label, value, onChange, required, hint, error, ...rest }: FormInputProps) {
  return (
    <FormField label={label} required={required} hint={hint} error={error}>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={inputStyle}
      />
    </FormField>
  );
}

// ─── FormTextarea ──────────────────────────────────────

export interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
  error?: string;
  rows?: number;
}

export function FormTextarea({ label, value, onChange, required, hint, error, rows = 3, ...rest }: FormTextareaProps) {
  return (
    <FormField label={label} required={required} hint={hint} error={error}>
      <textarea
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
      />
    </FormField>
  );
}

// ─── FormSelect ────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  required?: boolean;
  hint?: string;
  error?: string;
}

export function FormSelect({ label, value, onChange, options, required, hint, error, ...rest }: FormSelectProps) {
  return (
    <FormField label={label} required={required} hint={hint} error={error}>
      <select
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FormField>
  );
}

// ─── FormCheckbox ──────────────────────────────────────

export interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
  disabled?: boolean;
}

export function FormCheckbox({ label, checked, onChange, hint, disabled }: FormCheckboxProps) {
  return (
    <label style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      color: 'var(--text-primary)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{ accentColor: 'var(--accent-primary)', cursor: disabled ? 'not-allowed' : 'pointer' }}
      />
      {label}
      {hint && (
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 4 }}>
          {hint}
        </span>
      )}
    </label>
  );
}

// ─── FormSection (Sub-Header in Forms) ─────────────────

export function FormSection({ children }: { children: ReactNode }) {
  return (
    <div style={{
      fontSize: 'var(--font-size-xs)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'var(--text-tertiary)',
      fontWeight: 'var(--font-weight-semibold)',
      marginTop: 6,
    }}>
      {children}
    </div>
  );
}

// ─── StatusBadge (theme-aware Status-Anzeige) ──────────

export interface StatusBadgeProps {
  label: string;
  /** Semantik bestimmt die Farbe. Default 'neutral'. */
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

const VARIANT_COLORS: Record<NonNullable<StatusBadgeProps['variant']>, { fg: string; bg: string }> = {
  success: { fg: 'var(--status-bestaetigt)', bg: 'var(--status-bestaetigt-bg)' },
  warning: { fg: 'var(--status-angefragt)', bg: 'var(--status-angefragt-bg)' },
  danger: { fg: 'var(--status-abgelehnt)', bg: 'var(--status-abgelehnt-bg)' },
  info: { fg: 'var(--status-rueckfrage)', bg: 'var(--status-rueckfrage-bg)' },
  neutral: { fg: 'var(--text-secondary)', bg: 'var(--bg-tertiary)' },
};

export function StatusBadge({ label, variant = 'neutral' }: StatusBadgeProps) {
  const c = VARIANT_COLORS[variant];
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 'var(--radius-sm)',
      background: c.bg,
      color: c.fg,
      fontSize: 11,
      fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

// ─── Internal Styles ───────────────────────────────────

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-default)',
  background: 'var(--bg-input)',
  color: 'var(--text-primary)',
  fontSize: 13,
  outline: 'none',
};
