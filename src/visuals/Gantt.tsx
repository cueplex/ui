import { useMemo } from 'react';

export interface GanttProject {
  id: string;
  name: string;
  projectNumber?: string;
  startDate: string | Date;
  endDate: string | Date;
  color?: string;
  phase?: 'planung' | 'aufbau' | 'show' | 'abbau' | 'abgerechnet';
}

export interface GanttProps {
  projects: GanttProject[];
  onProjectClick?: (project: GanttProject) => void;
  monthsVisible?: number; // default: 3
}

const PHASE_LABELS: Record<string, string> = {
  planung: 'Planung',
  aufbau: 'Aufbau',
  show: 'Show',
  abbau: 'Abbau',
  abgerechnet: 'Abgerechnet',
};

const DAY_MS = 86400000;

function parseDate(s: string | Date): Date {
  if (s instanceof Date) {
    return isNaN(s.getTime()) ? new Date() : s;
  }
  // Accept both "YYYY-MM-DD" and full ISO strings
  const raw = typeof s === 'string' && s.length === 10 ? s + 'T00:00:00' : s;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date() : d;
}

function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

export function Gantt({ projects, onProjectClick, monthsVisible = 3 }: GanttProps) {
  const { rangeStart, totalDays, monthHeaders } = useMemo(() => {
    if (projects.length === 0) {
      const now = new Date();
      const start = new Date(now.getTime() - 14 * DAY_MS);
      const fallbackDays = Math.max(monthsVisible, 1) * 30 + 14;
      const end = new Date(now.getTime() + fallbackDays * DAY_MS);
      return {
        rangeStart: start,
        rangeEnd: end,
        totalDays: fallbackDays + 14,
        monthHeaders: [] as { label: string; startCol: number; span: number }[],
      };
    }

    let minDate = Infinity;
    let maxDate = -Infinity;
    for (const p of projects) {
      const s = parseDate(p.startDate).getTime();
      const e = parseDate(p.endDate).getTime();
      if (s < minDate) minDate = s;
      if (e > maxDate) maxDate = e;
    }

    const padding = 14 * DAY_MS;
    const start = new Date(minDate - padding);
    const end = new Date(maxDate + padding);
    const days = Math.ceil((end.getTime() - start.getTime()) / DAY_MS);

    // Build month headers
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

    return { rangeStart: start, rangeEnd: end, totalDays: days, monthHeaders: headers };
  }, [projects, monthsVisible]);

  const todayCol = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.floor((now.getTime() - rangeStart.getTime()) / DAY_MS);
  }, [rangeStart]);

  const dayWidth = 28;
  const rowHeight = 40;
  const headerHeight = 50;
  const totalWidth = totalDays * dayWidth;

  const sortedProjects = useMemo(() => {
    return [...projects].sort(
      (a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime(),
    );
  }, [projects]);

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto' }}>
      <div
        style={{
          position: 'relative',
          minWidth: totalWidth,
          minHeight: headerHeight + sortedProjects.length * rowHeight + 20,
        }}
      >
        {/* Month headers */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', height: 24 }}>
            {monthHeaders.map((mh, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: mh.startCol * dayWidth,
                  width: mh.span * dayWidth,
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  lineHeight: '24px',
                  borderRight: '1px solid var(--border-light)',
                }}
              >
                {mh.label}
              </div>
            ))}
          </div>
          {/* Day numbers row */}
          <div style={{ display: 'flex', height: 22 }}>
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
                    lineHeight: '22px',
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

        {/* Grid lines (Mondays) */}
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
                height: sortedProjects.length * rowHeight,
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
              height: sortedProjects.length * rowHeight + 8,
              background: 'var(--status-abgelehnt, #e74c3c)',
              opacity: 0.7,
              zIndex: 5,
            }}
          />
        )}

        {/* Project bars */}
        {sortedProjects.map((p, rowIndex) => {
          const startCol = Math.floor(
            (parseDate(p.startDate).getTime() - rangeStart.getTime()) / DAY_MS,
          );
          const endCol = Math.ceil(
            (parseDate(p.endDate).getTime() - rangeStart.getTime()) / DAY_MS,
          );
          const span = Math.max(endCol - startCol + 1, 1);
          const color = p.color || '#4A90D9';
          const phase = p.phase;

          const tooltipLines = [
            p.projectNumber ? `${p.projectNumber} — ${p.name}` : p.name,
            `${formatDate(parseDate(p.startDate))} – ${formatDate(parseDate(p.endDate))}`,
            phase ? `Phase: ${PHASE_LABELS[phase] ?? phase}` : '',
          ].filter(Boolean);

          return (
            <div
              key={p.id}
              title={tooltipLines.join('\n')}
              onClick={onProjectClick ? () => onProjectClick(p) : undefined}
              style={{
                position: 'absolute',
                left: startCol * dayWidth,
                top: headerHeight + rowIndex * rowHeight + 4,
                width: span * dayWidth - 4,
                height: rowHeight - 8,
                background: color,
                borderRadius: 'var(--radius-sm)',
                cursor: onProjectClick ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                gap: 6,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                opacity: phase === 'abgerechnet' ? 0.5 : 1,
                transition: 'outline var(--transition-fast)',
              }}
            >
              {p.projectNumber && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  {p.projectNumber}
                </span>
              )}
              <span
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.85)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {p.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
