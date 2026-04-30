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
  /**
   * Pessimistic-Lock-Indikator: wenn gesetzt → Button disabled, Schloss-Icon links,
   * native Tooltip "wird bearbeitet von {lockedBy}". Additiv, optional.
   * Komplementaer zu Optimistic-Locks (ETag) — schliesst die UX-Luecke
   * "jemand tippt gerade, ich seh's bevor ich klicke".
   */
  lockedBy?: string;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading,
  lockedBy,
  children,
  disabled,
  style,
  title,
  ...rest
}: ButtonProps) {
  const isLocked = Boolean(lockedBy);
  const effectiveDisabled = disabled || loading || isLocked;
  const sizeStyle = SIZE_STYLES[size];
  const variantStyle = VARIANT_STYLES[variant];
  const finalStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontFamily: 'inherit',
    fontWeight: 600,
    cursor: effectiveDisabled ? 'not-allowed' : 'pointer',
    opacity: effectiveDisabled ? 0.55 : 1,
    transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease',
    whiteSpace: 'nowrap',
    ...sizeStyle,
    ...variantStyle,
    ...style,
  };

  const lockTitle = isLocked ? `wird bearbeitet von ${lockedBy}` : title;
  const iconSize = size === 'sm' ? 11 : size === 'lg' ? 16 : 13;
  const leftSlot = loading
    ? <Spinner size={iconSize} />
    : isLocked
    ? <LockIcon size={iconSize} />
    : leftIcon;

  return (
    <button
      {...rest}
      disabled={effectiveDisabled}
      title={lockTitle}
      aria-disabled={effectiveDisabled || undefined}
      style={finalStyle}
      onMouseEnter={(e) => {
        if (effectiveDisabled) return;
        const hover = HOVER_STYLES[variant];
        Object.assign(e.currentTarget.style, hover);
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (effectiveDisabled) return;
        Object.assign(e.currentTarget.style, variantStyle);
        rest.onMouseLeave?.(e);
      }}
    >
      {leftSlot}
      {children}
      {!loading && !isLocked && rightIcon}
    </button>
  );
}

function LockIcon({ size }: { size: number }) {
  // Inline-SVG (kein lucide-react peer-dep zwingend hier).
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
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
