import { useMemo, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useTooltip } from '../feedback/Tooltip';

/**
 * Generischer Gantt fuer Zeit-Spanne-Visualisierung. Nicht crew-spezifisch:
 * Items sind frei (Projekte, Wartungen, Reservierungen, Stromlasten ...).
 * Layout-Werte kommen aus theme.css (--gantt-*-tokens), keine Magic Numbers.
 */

export interface GanttItem {
  id: string;
  /** Primaerer Text Zeile 1 (bold mono, z.B. Projektnummer). */
  label: string;
  /** Sekundaerer Text Zeile 1 (regular sans, z.B. Event-Name). */
  sublabel?: string;
  /** Zeile 2 linksbuendig (light, z.B. Status). Wird bei Overflow zugunsten metaRight gekuerzt. */
  metaLeft?: string;
  /** Zeile 2 rechtsbuendig (light, z.B. Personenzahl). Hat Vorrang bei Overflow. */
  metaRight?: string;
  startDate: string | Date;
  endDate: string | Date;
  /** Bar-Hintergrund. Default: --accent-primary. */
  color?: string;
  /** 50% Opacity (z.B. archivierte Items). */
  dimmed?: boolean;
  /** Multi-line Tooltip (native title). Wenn nicht gesetzt: label + sublabel + Datum. */
  tooltip?: string[];
}

export interface GanttProps {
  items: GanttItem[];
  /** Item-ID die mit Outline hervorgehoben wird (z.B. ausgewaehltes Projekt). */
  selectedId?: string | null;
  onItemClick?: (item: GanttItem) => void;
  /** Wenn keine Items vorhanden — wird ueber dem leeren Grid angezeigt. */
  emptyMessage?: string;
  /** Falls items gefiltert sind (z.B. Status), bleibt die Range stabil basierend auf
   * dieser Referenz. Monate/Tage/Heute-Marker springen damit nicht beim Filtern. */
  rangeReference?: { startDate: string | Date; endDate: string | Date }[];
}

/** Imperatives API ueber ref. Konsumenten triggern z.B. einen "Heute"-Button-Scroll. */
export interface GanttHandle {
  /** Scrollt so dass "heute" bei ca. 1/4 der Viewport-Breite von links sichtbar ist. */
  scrollToToday: () => void;
}

const DAY_MS = 86400000;
const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function parseDate(s: string | Date): Date {
  if (s instanceof Date) return isNaN(s.getTime()) ? new Date() : s;
  const raw = typeof s === 'string' && s.length === 10 ? s + 'T00:00:00' : s;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date() : d;
}

function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function getCssNumber(varName: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const n = parseFloat(v);
  return isNaN(n) ? fallback : n;
}

export const Gantt = forwardRef<GanttHandle, GanttProps>(function Gantt(
  { items, selectedId, onItemClick, emptyMessage, rangeReference },
  ref,
) {
  // Tokens aus CSS lesen — damit Layout zentral konfigurierbar bleibt.
  const dayWidth = getCssNumber('--gantt-day-width', 28);
  const rowHeight = getCssNumber('--gantt-row-height', 40);
  const monthRowHeight = getCssNumber('--gantt-month-row-height', 24);
  const dayRowHeight = getCssNumber('--gantt-day-row-height', 22);
  const headerHeight = monthRowHeight + dayRowHeight;
  const barVerticalMargin = getCssNumber('--gantt-bar-vertical-margin', 4);

  // Range-Quelle: rangeReference (falls gegeben) sonst items. So bleiben Monate/Tage/Heute
  // stabil wenn der Konsument items via Status filtert.
  const rangeSource = rangeReference && rangeReference.length > 0 ? rangeReference : items;

  const { rangeStart, totalDays, monthHeaders } = useMemo(() => {
    if (rangeSource.length === 0) {
      const now = new Date();
      const start = new Date(now.getTime() - 14 * DAY_MS);
      return {
        rangeStart: start,
        totalDays: 74,
        monthHeaders: [] as { label: string; startCol: number; span: number }[],
      };
    }

    let minDate = Infinity;
    let maxDate = -Infinity;
    for (const it of rangeSource) {
      const s = parseDate(it.startDate).getTime();
      const e = parseDate(it.endDate).getTime();
      if (s < minDate) minDate = s;
      if (e > maxDate) maxDate = e;
    }

    const padding = 14 * DAY_MS;
    const start = new Date(minDate - padding);
    const end = new Date(maxDate + padding);
    const days = Math.ceil((end.getTime() - start.getTime()) / DAY_MS);

    const headers: { label: string; startCol: number; span: number }[] = [];
    let current = new Date(start);
    while (current < end) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const visibleStart = monthStart < start ? start : monthStart;
      const visibleEnd = monthEnd > end ? end : monthEnd;
      const startCol = Math.floor((visibleStart.getTime() - start.getTime()) / DAY_MS);
      const span = Math.ceil((visibleEnd.getTime() - visibleStart.getTime()) / DAY_MS) + 1;
      headers.push({
        label: `${MONTH_NAMES[current.getMonth()]} ${current.getFullYear()}`,
        startCol,
        span,
      });
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    return { rangeStart: start, totalDays: days, monthHeaders: headers };
  }, [rangeSource]);

  const todayCol = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.floor((now.getTime() - rangeStart.getTime()) / DAY_MS);
  }, [rangeStart]);

  // Smart row-stacking: greedy interval-packing. Items die zeitlich nicht ueberlappen
  // teilen sich eine Zeile. Compact wie Linear/Asana Timeline statt klassischem Gantt
  // (eine Zeile pro Item). Spart vertikalen Platz.
  const { placedItems, rowCount } = useMemo(() => {
    const sorted = [...items].sort(
      (a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime(),
    );
    const rowEnds: number[] = []; // letzte endTime pro Zeile
    const placements: Array<{ item: GanttItem; rowIndex: number }> = [];
    for (const it of sorted) {
      const start = parseDate(it.startDate).getTime();
      const end = parseDate(it.endDate).getTime();
      let rowIndex = rowEnds.findIndex((e) => e < start);
      if (rowIndex === -1) {
        rowIndex = rowEnds.length;
        rowEnds.push(end);
      } else {
        rowEnds[rowIndex] = end;
      }
      placements.push({ item: it, rowIndex });
    }
    return { placedItems: placements, rowCount: rowEnds.length };
  }, [items]);

  const totalWidth = totalDays * dayWidth;
  const contentHeight = headerHeight + Math.max(rowCount, 1) * rowHeight + 20;

  // Drag-to-pan mit Momentum (iOS-style): track recent positions im Drag, beim
  // mouseup berechne avg velocity ueber letzte ~80ms, dann decay-loop mit Reibung.
  // Re-Grab waehrend Momentum addiert die alte velocity dazu (boost-effect).
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startX: number;
    startScrollLeft: number;
    samples: Array<{ x: number; t: number }>;
  } | null>(null);
  const momentumState = useRef<{ velocity: number; rafId: number | null }>({
    velocity: 0,
    rafId: null,
  });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const stopMomentum = () => {
      if (momentumState.current.rafId !== null) {
        cancelAnimationFrame(momentumState.current.rafId);
        momentumState.current.rafId = null;
      }
    };

    const startMomentum = () => {
      const FRICTION = 0.94;       // pro frame: 6% Verlust → ~25 frames bis still
      const MIN_VELOCITY = 0.5;    // px/frame Schwelle
      let lastTime = performance.now();
      const tick = (now: number) => {
        const el2 = scrollerRef.current;
        if (!el2) return;
        const dt = Math.min(now - lastTime, 32) / 16; // normalisiert auf ~60fps frames
        lastTime = now;
        el2.scrollLeft -= momentumState.current.velocity * dt;
        momentumState.current.velocity *= Math.pow(FRICTION, dt);
        if (Math.abs(momentumState.current.velocity) < MIN_VELOCITY) {
          momentumState.current.velocity = 0;
          momentumState.current.rafId = null;
          return;
        }
        momentumState.current.rafId = requestAnimationFrame(tick);
      };
      momentumState.current.rafId = requestAnimationFrame(tick);
    };

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('[data-gantt-bar]')) return;
      // Boost: bestehende Momentum-Velocity uebernehmen, sonst von 0 starten
      stopMomentum();
      // (velocity bleibt im momentumState — wird beim mouseup neu gesetzt mit boost)
      dragState.current = {
        startX: e.clientX,
        startScrollLeft: el.scrollLeft,
        samples: [{ x: e.clientX, t: performance.now() }],
      };
      el.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const onMove = (e: MouseEvent) => {
      const ds = dragState.current;
      if (!ds) return;
      const dx = e.clientX - ds.startX;
      el.scrollLeft = ds.startScrollLeft - dx;
      const now = performance.now();
      ds.samples.push({ x: e.clientX, t: now });
      // Halte nur letzte 80ms an Samples
      while (ds.samples.length > 1 && now - ds.samples[0].t > 80) ds.samples.shift();
    };

    const onUp = () => {
      const ds = dragState.current;
      if (!ds) return;
      el.style.cursor = 'grab';
      // Momentum: avg velocity ueber letzte ~80ms (px/16ms-frame)
      if (ds.samples.length >= 2) {
        const first = ds.samples[0];
        const last = ds.samples[ds.samples.length - 1];
        const dt = last.t - first.t;
        if (dt > 5) {
          const dragVelocity = (last.x - first.x) / dt * 16; // px per 16ms
          // Boost: zur bestehenden Velocity addieren (re-grab-effect)
          momentumState.current.velocity += dragVelocity;
          if (Math.abs(momentumState.current.velocity) > 0.5) {
            startMomentum();
          }
        }
      }
      dragState.current = null;
    };

    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      stopMomentum();
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // "Heute" zentriert bei 1/4 Viewport-Breite von links — gut sichtbar mit Future-Bias
  // (man sieht 3/4 der Bars die noch kommen, 1/4 der Bars die schon waren).
  // Stop active momentum first sonst konkurrieren beide um scrollLeft.
  const scrollToToday = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (momentumState.current.rafId !== null) {
      cancelAnimationFrame(momentumState.current.rafId);
      momentumState.current.rafId = null;
      momentumState.current.velocity = 0;
    }
    const todayPx = todayCol * dayWidth + dayWidth / 2;
    const target = Math.max(0, todayPx - el.clientWidth / 4);
    el.scrollTo({ left: target, behavior: 'smooth' });
  }, [todayCol, dayWidth]);

  useImperativeHandle(ref, () => ({ scrollToToday }), [scrollToToday]);

  // Initial scroll-to-today: einmal nach Layout fertig + items geladen, ohne Smooth-Anim (sofort).
  const didInitialScroll = useRef(false);
  useEffect(() => {
    if (didInitialScroll.current) return;
    if (items.length === 0) return;
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const todayPx = todayCol * dayWidth + dayWidth / 2;
    const target = Math.max(0, todayPx - el.clientWidth / 4);
    el.scrollLeft = target; // ohne smooth — beim Open soll's einfach da sein
    didInitialScroll.current = true;
  }, [items.length, todayCol, dayWidth]);

  if (items.length === 0 && emptyMessage) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-tertiary)',
        fontSize: 'var(--font-size-md)',
      }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={scrollerRef}
      className="cxl-hide-scrollbar"
      style={{
        // overflow auto (nicht hidden!) damit Browser smooth-scrollTo funktioniert.
        // Scrollbar wird via theme.css .cxl-hide-scrollbar visuell versteckt
        // (scrollbar-width:none + ::-webkit-scrollbar:none). Drag-Pan funktioniert
        // weiterhin via direktes scrollLeft setzen.
        overflowX: 'auto',
        overflowY: 'auto',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      <div style={{ position: 'relative', minWidth: totalWidth, minHeight: contentHeight }}>
        {/* Month + day headers (sticky top) */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', height: monthRowHeight }}>
            {monthHeaders.map((mh, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: mh.startCol * dayWidth,
                  width: mh.span * dayWidth,
                  textAlign: 'center',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-secondary)',
                  lineHeight: `${monthRowHeight}px`,
                  borderRight: '1px solid var(--border-light)',
                }}
              >
                {mh.label}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', height: dayRowHeight }}>
            {Array.from({ length: totalDays }, (_, i) => {
              const d = new Date(rangeStart.getTime() + i * DAY_MS);
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const isMonday = d.getDay() === 1;
              return (
                <div
                  key={i}
                  style={{
                    width: dayWidth,
                    flexShrink: 0,
                    textAlign: 'center',
                    fontSize: 9,
                    color: isWeekend ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                    lineHeight: `${dayRowHeight}px`,
                    borderRight: isMonday ? '1px solid var(--border-light)' : undefined,
                    background: isWeekend ? 'var(--bg-tertiary)' : undefined,
                    opacity: isWeekend ? 0.5 : 1,
                  }}
                >
                  {d.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Monday gridlines */}
        {Array.from({ length: totalDays }, (_, i) => {
          const d = new Date(rangeStart.getTime() + i * DAY_MS);
          if (d.getDay() !== 1) return null;
          return (
            <div
              key={`grid-${i}`}
              style={{
                position: 'absolute',
                left: i * dayWidth,
                top: headerHeight,
                width: 1,
                height: rowCount * rowHeight,
                background: 'var(--border-light)',
                opacity: 0.5,
              }}
            />
          );
        })}

        {/* Today marker */}
        {todayCol >= 0 && todayCol < totalDays && (
          <div
            style={{
              position: 'absolute',
              left: todayCol * dayWidth + dayWidth / 2,
              top: headerHeight - 4,
              width: 2,
              height: rowCount * rowHeight + 8,
              background: 'var(--status-abgelehnt)',
              opacity: 0.7,
              zIndex: 5,
            }}
          />
        )}

        {/* Item bars (compact stacking — items teilen rows wenn nicht ueberlappend) */}
        {placedItems.map(({ item: it, rowIndex }) => {
          const startCol = Math.floor((parseDate(it.startDate).getTime() - rangeStart.getTime()) / DAY_MS);
          const endCol = Math.ceil((parseDate(it.endDate).getTime() - rangeStart.getTime()) / DAY_MS);
          const span = Math.max(endCol - startCol + 1, 1);
          const isSelected = selectedId != null && it.id === selectedId;
          return (
            <GanttBar
              key={it.id}
              item={it}
              left={startCol * dayWidth}
              top={headerHeight + rowIndex * rowHeight + barVerticalMargin}
              width={span * dayWidth - 4}
              height={rowHeight - barVerticalMargin * 2}
              isSelected={isSelected}
              onClick={onItemClick ? () => onItemClick(it) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
});

interface GanttBarProps {
  item: GanttItem;
  left: number;
  top: number;
  width: number;
  height: number;
  isSelected: boolean;
  onClick?: () => void;
}

function GanttBar({ item, left, top, width, height, isSelected, onClick }: GanttBarProps) {
  // Default-Tooltip-Lines wenn item.tooltip nicht gesetzt
  const tooltipLines = item.tooltip ?? [
    item.sublabel ? `${item.label} — ${item.sublabel}` : item.label,
    `${formatDate(parseDate(item.startDate))} – ${formatDate(parseDate(item.endDate))}`,
  ];
  const { triggerProps, portal } = useTooltip<HTMLDivElement>({ text: tooltipLines });
  const color = item.color || 'var(--accent-primary)';

  return (
    <>
      <div
        {...triggerProps}
        data-gantt-bar=""
        onClick={onClick}
        style={{
          position: 'absolute',
          left,
          top,
          width,
          height,
          background: color,
          borderRadius: 'var(--radius-sm)',
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 1,
          padding: `0 var(--gantt-bar-padding-x)`,
          overflow: 'hidden',
          outline: isSelected ? '2px solid var(--text-primary)' : 'none',
          outlineOffset: 1,
          opacity: item.dimmed ? 0.35 : 1,
          transition: 'outline var(--transition-fast)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 'var(--gantt-bar-gap)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          minWidth: 0,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 700,
            color: '#fff',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            flexShrink: 0,
          }}>
            {item.label}
          </span>
          {item.sublabel && (
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-normal)',
              color: 'rgba(255,255,255,0.92)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0,
            }}>
              {item.sublabel}
            </span>
          )}
        </div>
        {(item.metaLeft || item.metaRight) && (
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 'var(--gantt-bar-gap)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.78)',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}>
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0,
            }}>
              {item.metaLeft ?? ''}
            </span>
            {item.metaRight && (
              <span style={{ flexShrink: 0 }}>
                {item.metaRight}
              </span>
            )}
          </div>
        )}
      </div>
      {portal}
    </>
  );
}
