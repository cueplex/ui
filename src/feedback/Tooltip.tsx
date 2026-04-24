import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

const DEFAULT_DELAY = 250;
const GAP = 6;          // Abstand Tooltip <-> Element
const VIEWPORT_PADDING = 8;

function TooltipPortal({
  text,
  triggerRect,
}: {
  text: string | string[];
  triggerRect: DOMRect;
}) {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  // Initial position: below-center, best-guess (wird nach Measure korrigiert).
  const [pos, setPos] = useState({
    top: triggerRect.bottom + GAP,
    left: triggerRect.left + triggerRect.width / 2,
    visible: false,
  });

  useLayoutEffect(() => {
    const el = tooltipRef.current;
    if (!el) return;
    const ttRect = el.getBoundingClientRect();
    const ttWidth = ttRect.width;
    const ttHeight = ttRect.height;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    // Horizontal: mittig zum Trigger, geclamped in Viewport
    const idealLeft = triggerRect.left + triggerRect.width / 2 - ttWidth / 2;
    const left = Math.min(
      Math.max(VIEWPORT_PADDING, idealLeft),
      vpW - ttWidth - VIEWPORT_PADDING,
    );

    // Vertikal: default below, flip up wenn unten kein Platz
    const fitsBelow = triggerRect.bottom + ttHeight + GAP <= vpH - VIEWPORT_PADDING;
    const top = fitsBelow
      ? triggerRect.bottom + GAP
      : Math.max(VIEWPORT_PADDING, triggerRect.top - ttHeight - GAP);

    setPos({ top, left, visible: true });
  }, [triggerRect]);

  const lines = Array.isArray(text) ? text : [text];
  return createPortal(
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        padding: '5px 10px',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        fontSize: 'var(--font-size-sm)',
        lineHeight: 1.5,
        whiteSpace: 'nowrap',
        zIndex: 9999,
        pointerEvents: 'none',
        // Vor Measure unsichtbar, nach Measure sichtbar — verhindert "snap"
        opacity: pos.visible ? 1 : 0,
        transition: 'opacity 80ms ease',
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>,
    document.body,
  );
}

export interface UseTooltipOptions {
  text: string | string[];
  delay?: number;
  instant?: boolean;
}

/**
 * Hook-basierte Tooltip-Variante. Fuer Elemente die KEINE Wrapper-DOM
 * vertragen (z.B. position:absolute Bars im Gantt). Returnt triggerProps
 * die man auf das Element spreaded + portal das man rendert.
 */
export function useTooltip<T extends HTMLElement = HTMLElement>({
  text,
  delay = DEFAULT_DELAY,
  instant,
}: UseTooltipOptions) {
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const ref = useRef<T | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    const trigger = () => {
      if (ref.current) setTriggerRect(ref.current.getBoundingClientRect());
    };
    if (instant || delay === 0) trigger();
    else timeoutRef.current = setTimeout(trigger, delay);
  }, [delay, instant]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTriggerRect(null);
  }, []);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return {
    triggerProps: {
      ref: ref as RefObject<T>,
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
    },
    portal: triggerRect ? <TooltipPortal text={text} triggerRect={triggerRect} /> : null,
  };
}

export interface TooltipProps {
  text: string | string[];
  children: ReactNode;
  /** Delay in ms bevor Tooltip erscheint. Default: 250ms (schnell aber nicht hektisch). */
  delay?: number;
  /** Falls true, Tooltip erscheint sofort (delay=0). */
  instant?: boolean;
}

/**
 * Wrapper-basiertes Tooltip — bequem fuer normale Inline-Elemente. Fuer
 * position:absolute oder andere Layout-Edge-Cases lieber useTooltip nutzen.
 */
export function Tooltip({ text, children, delay, instant }: TooltipProps) {
  const { triggerProps, portal } = useTooltip<HTMLSpanElement>({ text, delay, instant });
  return (
    <span {...triggerProps} style={{ display: 'inline-flex' }}>
      {children}
      {portal}
    </span>
  );
}
