import { useRef } from 'react';
import { Sun, MoonStar, Sparkles } from 'lucide-react';
import { useTheme } from '../theme/useTheme';

// Disco-Icon: aktuell Lucide Sparkles (professionell, Lucide-Stil).
// TODO: gescheites Unicorn-SVG finden (custom war zu scaffed).

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
          <Sparkles size={16} />
        ) : theme === 'light' ? (
          <Sun size={16} />
        ) : (
          <MoonStar size={16} />
        )}
      </span>
    </button>
  );
}
