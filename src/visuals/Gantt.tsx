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
  /** Markiert das Item als Langzeit/Dauermiete — separater Lane unten + halbe Hoehe.
   * Domaenen-Bit (z.B. "Dauermiete"-Flag im Projekt). Nicht ueber Dauer berechnen. */
  longTerm?: boolean;
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
  /** Wenn true: Items mit longTerm=true werden komplett ausgeblendet (bleiben aber in rangeReference). */
  hideLongTerm?: boolean;
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
  {
    items,
    selectedId,
    onItemClick,
    emptyMessage,
    rangeReference,
    hideLongTerm = false,
  },
  ref,
) {
  // Tokens aus CSS lesen — damit Layout zentral konfigurierbar bleibt.
  const dayWidth = getCssNumber('--gantt-day-width', 28);
  const rowHeight = getCssNumber('--gantt-row-height', 40);
  const monthRowHeight = getCssNumber('--gantt-month-row-height', 24);
  const dayRowHeight = getCssNumber('--gantt-day-row-height', 22);
  const headerHeight = monthRowHeight + dayRowHeight;
  const barVerticalMargin = getCssNumber('--gantt-bar-vertical-margin', 2);

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

  // Trennung in Short-Term (echte Projekte) und Long-Term (Dauermieten) — die Long-Term-Lane
  // landet unten und nimmt halbe Bar-Hoehe ein, damit sie den Hauptbereich nicht blockiert.
  // longTerm ist ein Item-Flag (Domaene), kein berechnetes Threshold — Konsument setzt es
  // basierend auf Projekt-Eigenschaft (z.B. Dauermiete-Boolean / Job-Kategorie).
  const { placedItems, shortRowCount, longRowCount, hasLongTerm } = useMemo(() => {
    const visible = hideLongTerm ? items.filter((it) => !it.longTerm) : items;

    const sorted = [...visible].sort(
      (a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime(),
    );

    const shortRowEnds: number[] = [];
    const longRowEnds: number[] = [];
    const placements: Array<{ item: GanttItem; rowIndex: number; lane: 'short' | 'long' }> = [];

    for (const it of sorted) {
      const start = parseDate(it.startDate).getTime();
      const end = parseDate(it.endDate).getTime();
      const isLong = !!it.longTerm;
      const rowEnds = isLong ? longRowEnds : shortRowEnds;
      let rowIndex = rowEnds.findIndex((e) => e < start);
      if (rowIndex === -1) {
        rowIndex = rowEnds.length;
        rowEnds.push(end);
      } else {
        rowEnds[rowIndex] = end;
      }
      placements.push({ item: it, rowIndex, lane: isLong ? 'long' : 'short' });
    }

    return {
      placedItems: placements,
      shortRowCount: shortRowEnds.length,
      longRowCount: longRowEnds.length,
      hasLongTerm: longRowEnds.length > 0,
    };
  }, [items, hideLongTerm]);

  const longRowHeight = Math.round(rowHeight / 2);
  const shortLanesHeight = Math.max(shortRowCount, 1) * rowHeight;
  const longLanesTop = headerHeight + shortLanesHeight + (hasLongTerm ? 8 : 0); // 8px Trenner
  const longLanesHeight = longRowCount * longRowHeight;
  const totalWidth = totalDays * dayWidth;
  const contentHeight = longLanesTop + longLanesHeight + 20;

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

  // Initial scroll-to-today: robust gegen Mount-vor-Layout. Wir versuchen es bis clientWidth>0,
  // dann genau einmal pro rangeStart (range stabil → Scroll bleibt). ResizeObserver triggert
  // beim ersten echten Layout — Component-Remount via Sidebar-Nav startet ResizeObserver neu.
  const didInitialScrollFor = useRef<number | null>(null);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const rangeKey = rangeStart.getTime();

    const tryScroll = () => {
      if (didInitialScrollFor.current === rangeKey) return true;
      if (items.length === 0) return false;
      if (el.clientWidth === 0) return false;
      const todayPx = todayCol * dayWidth + dayWidth / 2;
      const target = Math.max(0, todayPx - el.clientWidth / 4);
      el.scrollLeft = target;
      didInitialScrollFor.current = rangeKey;
      return true;
    };

    if (tryScroll()) return;

    // Fallback: ResizeObserver bis clientWidth verfuegbar
    const ro = new ResizeObserver(() => { tryScroll(); });
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length, todayCol, dayWidth, rangeStart]);

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

  // Sticky-Bar-Labels: setzt CSS-Variable --gantt-scroll-left auf den content-Wrapper.
  // GanttBar nutzt das im transform um label im sichtbaren Bereich zu halten — ohne
  // React-Re-Renders pro scroll-frame.
  const contentRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    const sl = scrollerRef.current?.scrollLeft ?? 0;
    contentRef.current?.style.setProperty('--gantt-scroll-left', sl + 'px');
  }, []);

  return (
    <div
      ref={scrollerRef}
      className="cxl-hide-scrollbar"
      onScroll={handleScroll}
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
      <div ref={contentRef} style={{ position: 'relative', minWidth: totalWidth, minHeight: contentHeight, ['--gantt-scroll-left' as never]: '0px' }}>
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
                height: shortRowCount * rowHeight,
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
              height: shortRowCount * rowHeight + 8,
              background: 'var(--status-abgelehnt)',
              opacity: 0.7,
              zIndex: 5,
            }}
          />
        )}

        {/* Item bars (compact stacking — items teilen rows wenn nicht ueberlappend) */}
        {placedItems.map(({ item: it, rowIndex, lane }) => {
          const startCol = Math.floor((parseDate(it.startDate).getTime() - rangeStart.getTime()) / DAY_MS);
          const endCol = Math.ceil((parseDate(it.endDate).getTime() - rangeStart.getTime()) / DAY_MS);
          const span = Math.max(endCol - startCol + 1, 1);
          const isSelected = selectedId != null && it.id === selectedId;
          const isLong = lane === 'long';
          const top = isLong
            ? longLanesTop + rowIndex * longRowHeight
            : headerHeight + rowIndex * rowHeight + barVerticalMargin;
          const height = isLong ? longRowHeight - 2 : rowHeight - barVerticalMargin * 2;
          const barLeft = startCol * dayWidth;
          return (
            <GanttBar
              key={it.id}
              item={it}
              left={barLeft}
              top={top}
              width={span * dayWidth - 4}
              height={height}
              compact={isLong}
              isSelected={isSelected}
              onClick={onItemClick ? () => onItemClick(it) : undefined}
            />
          );
        })}
        {/* Trenner zwischen Short- und Long-Term-Lane */}
        {hasLongTerm && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: longLanesTop - 4,
            width: totalWidth,
            height: 1,
            background: 'var(--border-default)',
            opacity: 0.5,
          }} />
        )}
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
  compact?: boolean;
  isSelected: boolean;
  onClick?: () => void;
}

// Deterministischer Farbgenerator aus item.id: voll variabler Hue, sehr niedrige
// Saturation (8-15%) damit nichts grell wirkt, Lightness 38-55%. Konsument-Override
// via item.color hat Vorrang. Patrick-Entscheidung 27.04.2026 (zuvor cueplex-grün
// + 22-32% Saturation war zu knallig).
function autoColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  const saturation = 8 + (Math.abs(h >> 4) % 8); // 8..15
  const lightness = 38 + (Math.abs(h >> 8) % 18); // 38..55
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function GanttBar({ item, left, top, width, height, compact, isSelected, onClick }: GanttBarProps) {
  // Default-Tooltip-Lines wenn item.tooltip nicht gesetzt
  const tooltipLines = item.tooltip ?? [
    item.sublabel ? `${item.label} — ${item.sublabel}` : item.label,
    `${formatDate(parseDate(item.startDate))} – ${formatDate(parseDate(item.endDate))}`,
  ];
  const { triggerProps, portal } = useTooltip<HTMLDivElement>({ text: tooltipLines });
  const color = item.color || autoColor(item.id);

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
          gap: 0,
          padding: `0 var(--gantt-bar-padding-x)`,
          lineHeight: 1,
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
          // Sticky-Label: bei langen Bars die ueber den linken Viewport-Rand gescrolled
          // sind, schiebt sich der Inhalt nach rechts so dass er sichtbar bleibt.
          // calc clamped: 0 wenn bar noch nicht über Rand, sonst delta zur Bar-Linkskante.
          transform: `translateX(max(0px, calc(var(--gantt-scroll-left, 0px) - ${left}px)))`,
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
        {!compact && (item.metaLeft || item.metaRight) && (
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
