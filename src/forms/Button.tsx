// Button — generischer Button-Primitive fuer cueplex.
// Patrick 29.04.2026: „Wir haben Buttons in irgendeinem UI-Dokument generalisiert
// und dafuer einen Token gebaut oder so. Dann lass uns doch einfach die Buttons
// nehmen fuer alles."
//
// Variants:
//   - 'primary'   = Akzent-Background (Orange) — Hauptaktion. SPARSAM einsetzen.
//   - 'secondary' = Border-Outline + transparent — Standard für die meisten Aktionen.
//   - 'ghost'     = nur Text+Icon, kein Border — Toolbar/Header-Aktionen.
//   - 'danger'    = Status-abgelehnt-Farbe — destruktive Aktionen.
//
// Sizes:
//   - 'sm' = 24px hoch, fontSize 11
//   - 'md' = 32px hoch, fontSize 13 (Default)
//   - 'lg' = 40px hoch, fontSize 14

import {
  type ButtonHTMLAttributes,
  type ReactNode,
  type CSSProperties,
} from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon links vom Label */
  leftIcon?: ReactNode;
  /** Icon rechts vom Label */
  rightIcon?: ReactNode;
  /** Loading-Spinner statt Icon, disabled = true */
  loading?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const sizeStyle = SIZE_STYLES[size];
  const variantStyle = VARIANT_STYLES[variant];
  const finalStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontFamily: 'inherit',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.55 : 1,
    transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease',
    whiteSpace: 'nowrap',
    ...sizeStyle,
    ...variantStyle,
    ...style,
  };

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={finalStyle}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        const hover = HOVER_STYLES[variant];
        Object.assign(e.currentTarget.style, hover);
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (disabled || loading) return;
        Object.assign(e.currentTarget.style, variantStyle);
        rest.onMouseLeave?.(e);
      }}
    >
      {loading ? <Spinner size={size === 'sm' ? 11 : size === 'lg' ? 16 : 13} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

function Spinner({ size }: { size: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, borderRadius: '50%',
        border: '2px solid currentColor', borderTopColor: 'transparent',
        animation: 'cxl-spin 600ms linear infinite',
        display: 'inline-block',
      }}
    />
  );
}

const SIZE_STYLES: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '0 8px', height: 24, fontSize: 11, borderRadius: 'var(--radius-sm)' },
  md: { padding: '0 12px', height: 32, fontSize: 13, borderRadius: 'var(--radius-sm)' },
  lg: { padding: '0 16px', height: 40, fontSize: 14, borderRadius: 'var(--radius-md)' },
};

const VARIANT_STYLES: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: 'var(--accent-primary)',
    color: 'var(--accent-primary-text, #fff)',
    border: '1px solid var(--accent-primary)',
  },
  secondary: {
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-default)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--bg-card)',
    color: 'var(--status-abgelehnt, #B85C5C)',
    border: '1px solid var(--status-abgelehnt, #B85C5C)',
  },
};

const HOVER_STYLES: Record<ButtonVariant, CSSProperties> = {
  primary: { background: 'color-mix(in srgb, var(--accent-primary) 88%, white 12%)' },
  secondary: { background: 'var(--bg-tertiary)', color: 'var(--text-primary)' },
  ghost: { background: 'var(--bg-tertiary)', color: 'var(--text-primary)' },
  danger: { background: 'color-mix(in srgb, var(--status-abgelehnt, #B85C5C) 12%, transparent)' },
};
