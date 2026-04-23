import { useRef } from 'react';
import { Sun, MoonStar } from 'lucide-react';
import { useTheme } from '../theme/useTheme';

// Custom Unicorn SVG — Lucide-Style (stroke-basiert, round caps). Kein Emoji.
// Easteregg bei 10 rapid clicks.
function Unicorn({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Pferdekopf-Profil nach rechts blickend */}
      <path d="M5 20 c-1-3 0-7 2.5-9.5 c1.5-1.5 3-2 4.5-2.5 L15 4 l-1 5 c2.5 0 5 1.5 6 4 c0.5 1.5 0.5 3 0 4.5 c-0.5 1.5-2 2.5-4 2.5 H7 c-1 0-1.5-0.2-2-0.5z" />
      {/* Horn — diagonal nach oben-links */}
      <path d="M15 4 L17 0 L14.2 3.2" />
      {/* Auge */}
      <circle cx="16" cy="14" r="0.6" fill="currentColor" stroke="none" />
      {/* Maehne-Strähnen */}
      <path d="M8 11 c-2 0.5-3.5 2-4 4" />
      <path d="M7 13 c-1.5 1-2.5 2.5-3 4" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const clickTimes = useRef<number[]>([]);

  const onClick = () => {
    const now = Date.now();
    clickTimes.current = [...clickTimes.current, now].filter((t) => now - t < 2000);

    if (theme === 'disco') {
      if (clickTimes.current.length >= 10) {
        clickTimes.current = [];
        setTheme('dark');
      }
      return;
    }

    if (clickTimes.current.length >= 10) {
      clickTimes.current = [];
      setTheme('disco');
      return;
    }
    toggleTheme();
  };

  const label =
    theme === 'disco'
      ? '10x klicken um Disco zu verlassen'
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
          <Unicorn size={16} />
        ) : theme === 'light' ? (
          <Sun size={16} />
        ) : (
          <MoonStar size={16} />
        )}
      </span>
    </button>
  );
}
