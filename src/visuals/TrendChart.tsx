import { useId, useRef, useState, type CSSProperties } from 'react';

/**
 * TrendChart — kumulatives Liniendiagramm mit Bezier-Smoothing, Hover-Tooltip,
 * Y-Achse mit "schönen" Werten, X-Achse mit Auto-Labels.
 *
 * Verwendung:
 *  <TrendChart
 *     buckets={[120, 60, 240, 0, 180, ...]}  // Werte pro Bucket (z.B. Minuten/Tag)
 *     xLabels={['1.','2.','3.',...]}          // Optional: pro-Bucket-Labels (default auto)
 *     unit="h"                                  // Y-Achse-Suffix; Werte werden via formatValue formatiert
 *     formatValue={v => `${(v/60).toFixed(1)} h`}  // Bucket → Display-String
 *     formatY={hrs => `${hrs} h`}              // Y-Tick → Display-String
 *  />
 *
 * Theme-aware via CSS-vars (--accent-primary, --border-light, --text-tertiary, --bg-card etc.).
 */

export interface TrendChartProps {
  /** Werte pro Bucket (Tage, Monate, …). Werden im Chart kumuliert. */
  buckets: number[];
  /** Beschriftung der X-Achse, eine pro Bucket. Wenn nicht gegeben, wird automatisch dezimiert. */
  xLabels?: string[];
  /** Format-Funktion für den Wert in Tooltip + Endpunkt-Anzeige. Default: rohe Zahl. */
  formatValue?: (v: number) => string;
  /** Format-Funktion für Y-Tick (auf Hours-Basis: niceCeil-Stufe → string). Default: Zahl + " h". */
  formatY?: (v: number) => string;
  /** Divisor von Bucket-Wert auf "Y-Einheit" (z.B. 60 wenn Bucket=Min und Y=Stunden). Default 1. */
  yUnitDivisor?: number;
  /** Tooltip-Titel pro Bucket-Index (z.B. "März"). Default: aus xLabels oder index+1. */
  tooltipTitle?: (idx: number) => string;
  /** Tooltip-Sub-Zeile (z.B. "+3:30 in diesem Monat"). Default: leer. */
  tooltipDelta?: (idx: number, value: number) => string;
  /** Aspect-Ratio (W/H). Default: 8/3 (modern wide). */
  aspect?: number;
  /** Mindesthöhe in px. Default 220. */
  minHeight?: number;
  style?: CSSProperties;
}

export function TrendChart({
  buckets,
  xLabels,
  formatValue = (v) => String(v),
  formatY = (v) => `${v} h`,
  yUnitDivisor = 1,
  tooltipTitle,
  tooltipDelta,
  aspect = 8 / 3,
  minHeight = 220,
  style,
}: TrendChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Eindeutige Gradient-ID — verhindert Kollision wenn mehrere TrendCharts gleichzeitig rendern
  const gradId = `trendchart-grad-${useId().replace(/:/g, '')}`;

  if (buckets.length === 0) return null;

  const cum: number[] = [];
  let acc = 0;
  for (const v of buckets) { acc += v; cum.push(acc); }
  const maxRaw = Math.max(...cum, 1);
  const maxYUnits = Math.ceil(maxRaw / yUnitDivisor);
  const niceMax = niceCeil(maxYUnits);

  const W = 800, H = Math.round(W / aspect);
  const padL = 48, padR = 16, padT = 12, padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const pts = cum.map((v, i) => {
    const x = padL + (i / (buckets.length - 1 || 1)) * innerW;
    const y = padT + innerH - ((v / yUnitDivisor) / niceMax) * innerH;
    return { x, y, idx: i, valueAbs: v, valueDelta: buckets[i] };
  });

  const curvePath = catmullRomPath(pts);
  const fillPath = `${curvePath} L${pts[pts.length - 1].x},${padT + innerH} L${pts[0].x},${padT + innerH} Z`;

  const ySteps = 4;
  const yTicks = Array.from({ length: ySteps + 1 }, (_, i) => (niceMax * i) / ySteps);

  // X-Labels: wenn explizit, max 12 anzeigen (gleichmäßig); sonst Auto-Dezimieren bei Tagen
  const xTicks = computeXTicks(buckets.length, xLabels);

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const xRel = ((e.clientX - r.left) / r.width) * W;
    if (xRel < padL || xRel > W - padR) { setHoverIdx(null); return; }
    const idx = Math.round(((xRel - padL) / innerW) * (buckets.length - 1));
    setHoverIdx(Math.max(0, Math.min(buckets.length - 1, idx)));
  };

  const hoverPt = hoverIdx !== null ? pts[hoverIdx] : null;
  const titleFn = tooltipTitle ?? ((i: number) => xLabels?.[i] ?? String(i + 1));
  const deltaFn = tooltipDelta ?? ((_, v) => formatValue(v));

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: `${W} / ${H}`, minHeight, ...style }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((v, i) => {
          const y = padT + innerH - (v / niceMax) * innerH;
          return (
            <g key={i}>
              <line
                x1={padL} x2={W - padR} y1={y} y2={y}
                stroke="var(--border-light)"
                strokeDasharray={i === 0 ? undefined : '2 4'}
              />
              <text x={padL - 8} y={y + 3} textAnchor="end" style={axisTextStyle}>{formatY(v)}</text>
            </g>
          );
        })}
        {xTicks.map((it, i) => (
          <text
            key={i}
            x={padL + (it.idx / (buckets.length - 1 || 1)) * innerW}
            y={H - 10}
            textAnchor="middle"
            style={axisTextStyle}
          >{it.label}</text>
        ))}
        <path d={fillPath} fill={`url(#${gradId})`} />
        <path
          d={curvePath}
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle
          cx={pts[pts.length - 1].x}
          cy={pts[pts.length - 1].y}
          r="4.5"
          fill="var(--accent-primary)"
          stroke="var(--bg-card)"
          strokeWidth="2"
        />
        {hoverPt && (
          <g>
            <line
              x1={hoverPt.x} x2={hoverPt.x}
              y1={padT} y2={padT + innerH}
              stroke="var(--accent-primary)"
              strokeOpacity="0.4"
              strokeDasharray="2 3"
            />
            <circle
              cx={hoverPt.x} cy={hoverPt.y}
              r="4"
              fill="var(--accent-primary)"
              stroke="var(--bg-card)"
              strokeWidth="1.5"
            />
          </g>
        )}
      </svg>
      {hoverPt && (
        <div style={{
          position: 'absolute',
          left: `${(hoverPt.x / W) * 100}%`,
          top: `${(hoverPt.y / H) * 100}%`,
          transform: 'translate(-50%, calc(-100% - 12px))',
          pointerEvents: 'none',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm, 8px)',
          boxShadow: 'var(--shadow-md)',
          padding: '8px 12px',
          fontSize: 11,
          whiteSpace: 'nowrap',
          zIndex: 5,
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12, marginBottom: 2 }}>
            {titleFn(hoverPt.idx)}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>
            {formatValue(hoverPt.valueAbs)} kumulativ
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', fontSize: 10, marginTop: 1 }}>
            {deltaFn(hoverPt.idx, hoverPt.valueDelta)}
          </div>
        </div>
      )}
    </div>
  );
}

const axisTextStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  fill: 'var(--text-tertiary)',
};

/** Catmull-Rom-Smoothing als SVG-Path (smooth ohne externe Lib). */
function catmullRomPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
  const tension = 0.5;
  let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

/** Rundet auf eine "schöne" Zahl auf (1, 2, 2.5, 5, 10, 20, …). */
function niceCeil(v: number): number {
  if (v <= 0) return 10;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  const norm = v / base;
  let nice;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 2.5) nice = 2.5;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * base;
}

/** Wählt für die X-Achse passende Ticks: bei xLabels = explizit; sonst auto-dezimieren. */
function computeXTicks(n: number, xLabels?: string[]): Array<{ idx: number; label: string }> {
  if (xLabels && xLabels.length === n) {
    // Wenn ≤12 — alle, sonst gleichmäßig dezimieren
    if (n <= 12) return xLabels.map((label, idx) => ({ idx, label }));
    const step = Math.ceil(n / 8);
    const ticks: Array<{ idx: number; label: string }> = [];
    for (let i = 0; i < n; i += step) ticks.push({ idx: i, label: xLabels[i] });
    if (ticks[ticks.length - 1].idx !== n - 1) ticks.push({ idx: n - 1, label: xLabels[n - 1] });
    return ticks;
  }
  // Default für Tage: 1, 5, 10, 15, 20, 25, ende
  if (n >= 28 && n <= 31) {
    const days = [1, 5, 10, 15, 20, 25, n];
    return days.map(d => ({ idx: d - 1, label: `${d}.` }));
  }
  // Sonst gleichmäßig 7 Ticks
  const step = Math.max(1, Math.floor(n / 6));
  const ticks: Array<{ idx: number; label: string }> = [];
  for (let i = 0; i < n; i += step) ticks.push({ idx: i, label: String(i + 1) });
  if (ticks[ticks.length - 1].idx !== n - 1) ticks.push({ idx: n - 1, label: String(n) });
  return ticks;
}
