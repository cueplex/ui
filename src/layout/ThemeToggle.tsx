import { useRef } from 'react';
import { Sun, MoonStar } from 'lucide-react';
import { useTheme } from '../theme/useTheme';

// Custom Disco-Ball SVG — Easteregg (10x rapid click).
function DiscoBall({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: 'cxl-disco-spin 3s linear infinite' }}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <path d="M5.6 5.6l12.8 12.8" />
      <path d="M18.4 5.6L5.6 18.4" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 0v2" strokeWidth="1.5" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const clickTimes = useRef<number[]>([]);

  const onClick = () => {
    const now = Date.now();
    // Nur Clicks der letzten 2 Sekunden zaehlen
    clickTimes.current = [...clickTimes.current, now].filter((t) => now - t < 2000);

    if (clickTimes.current.length >= 10) {
      clickTimes.current = [];
      setTheme(theme === 'disco' ? 'dark' : 'disco');
      return;
    }
    toggleTheme();
  };

  const label =
    theme === 'disco'
      ? 'Wieder normal (10x klicken)'
      : theme === 'light'
        ? 'Dark Mode'
        : 'Light Mode';

  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 32, height: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: 'transparent',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
      }}
    >
      <span
        key={theme}
        style={{
          display: 'inline-flex',
          animation: 'cxl-theme-icon-swap 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {theme === 'disco' ? (
          <DiscoBall size={16} />
        ) : theme === 'light' ? (
          <Sun size={16} />
        ) : (
          <MoonStar size={16} />
        )}
      </span>
    </button>
  );
}
