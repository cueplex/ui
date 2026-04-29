import { useState, useRef, useEffect, useMemo, type ReactNode, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { Tooltip } from '../feedback/Tooltip';

export interface SearchResult {
  id: string;
  /** Hauptzeile im Dropdown-Eintrag (z.B. Projektnummer). */
  label: string;
  /** Sekundaere Zeile (z.B. Projektname). */
  sublabel?: string;
  /** Optionale Icon-Komponente links. */
  icon?: ReactNode;
  /** Gruppierungs-Header im Dropdown (z.B. "Projekte", "Crew"). */
  group?: string;
}

export interface SearchBarProps {
  /** Aktuelle Query — controlled. */
  query: string;
  /** Callback bei jeder Tastatur-Aenderung. */
  onQueryChange: (q: string) => void;
  /** Treffer die im Dropdown gerendert werden — der Konsument filtert selbst. */
  results: SearchResult[];
  /** Callback wenn ein Treffer gewaehlt wird (Click oder Enter). */
  onSelect?: (result: SearchResult) => void;
  /** Placeholder im Input wenn leer. */
  placeholder?: string;
  /** Text bei results.length===0 && query.length>0. RULE: niemals quiet error. */
  emptyHint?: string;
  /** Wenn true: Dropdown zeigt Loading-Indicator statt Treffer. */
  loading?: boolean;
  /** Initialer Zustand collapsed/expanded (uncontrolled). Default: collapsed. */
  defaultExpanded?: boolean;
  /** Controlled expanded state — wenn gesetzt, ueberschreibt defaultExpanded. */
  expanded?: boolean;
  /** Callback fuer Expand/Collapse (controlled mode). */
  onExpandedChange?: (expanded: boolean) => void;
  /** Max-Hoehe des Dropdowns in px. Default 360. */
  maxDropdownHeight?: number;
}

const COLLAPSED_WIDTH = 32;
const EXPANDED_WIDTH = 280;
const TRANSITION_MS = 150;

/**
 * Header-style Suchleiste mit Lupe-Icon (collapsed) -> Input (expanded) -> Live-Dropdown.
 * Escape resetet zur Lupe. X-Button im Input clearet Query. Dropdown gruppiert nach result.group.
 * Bei leerer Trefferliste mit aktiver Query: emptyHint anzeigen (niemals quiet).
 */
export function SearchBar({
  query,
  onQueryChange,
  results,
  onSelect,
  placeholder = 'Suche…',
  emptyHint = 'Keine Ergebnisse',
  loading = false,
  defaultExpanded = false,
  expanded: expandedProp,
  onExpandedChange,
  maxDropdownHeight = 360,
}: SearchBarProps) {
  const [expandedInternal, setExpandedInternal] = useState(defaultExpanded);
  const expanded = expandedProp ?? expandedInternal;
  const setExpanded = (v: boolean) => {
    if (expandedProp === undefined) setExpandedInternal(v);
    onExpandedChange?.(v);
  };
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dropdownOpen = expanded && query.length > 0;

  // Click-outside collapsed Dropdown (aber Input bleibt expanded mit query)
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  // Reset focused-index wenn Treffer-Liste sich aendert
  useEffect(() => {
    setFocusedIndex(-1);
  }, [results]);

  const expand = () => {
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const collapse = () => {
    onQueryChange('');
    setExpanded(false);
    setFocusedIndex(-1);
    inputRef.current?.blur();
  };

  const clearQuery = () => {
    onQueryChange('');
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      collapse();
      return;
    }
    if (!dropdownOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      const target = focusedIndex >= 0 ? results[focusedIndex] : results[0];
      if (target && onSelect) onSelect(target);
    }
  };

  // Gruppierung: stabiles Sort nach erstem Vorkommen einer group
  const groupedResults = useMemo(() => {
    const groups: Array<{ group: string | undefined; items: SearchResult[] }> = [];
    const seenGroups = new Map<string | undefined, number>();
    for (const r of results) {
      const g = r.group;
      const idx = seenGroups.get(g);
      if (idx == null) {
        seenGroups.set(g, groups.length);
        groups.push({ group: g, items: [r] });
      } else {
        groups[idx].items.push(r);
      }
    }
    return groups;
  }, [results]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        style={{
          width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: expanded ? '0 8px' : 0,
          borderRadius: 'var(--radius-sm)',
          border: expanded ? '1px solid var(--border-default)' : '1px solid transparent',
          background: expanded ? 'var(--bg-input)' : 'transparent',
          transition: `width ${TRANSITION_MS}ms ease, border-color ${TRANSITION_MS}ms ease, background ${TRANSITION_MS}ms ease, padding ${TRANSITION_MS}ms ease`,
          overflow: 'hidden',
        }}
      >
        {!expanded ? (
          <Tooltip text="Suchen">
            <button
            onClick={expand}
            style={{
              width: COLLAPSED_WIDTH,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Search size={16} />
          </button>
          </Tooltip>
        ) : (
          <>
            <Search size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-size-body)',
                lineHeight: 1.5,
              }}
            />
            {query.length > 0 && (
              <Tooltip text="Löschen">
                <button
                  onClick={clearQuery}
                  style={{
                    width: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <X size={12} />
                </button>
              </Tooltip>
            )}
          </>
        )}
      </div>

      {/* Dropdown: nur wenn expanded UND query nicht leer */}
      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 6,
            width: EXPANDED_WIDTH,
            maxHeight: maxDropdownHeight,
            overflowY: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            padding: 4,
          }}
        >
          {loading ? (
            <div style={{
              padding: '12px 14px',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
            }}>
              Suche…
            </div>
          ) : results.length === 0 ? (
            // RULE 5a8accca — niemals quiet bei leerer Suche
            <div style={{
              padding: '12px 14px',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
            }}>
              {emptyHint}
            </div>
          ) : (
            groupedResults.map((g, gi) => (
              <div key={gi}>
                {g.group && (
                  <div style={{
                    padding: '6px 10px 4px',
                    fontSize: 'var(--font-size-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-tertiary)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}>
                    {g.group}
                  </div>
                )}
                {g.items.map((r) => {
                  const globalIdx = results.indexOf(r);
                  const isFocused = globalIdx === focusedIndex;
                  return (
                    <div
                      key={r.id}
                      onClick={() => onSelect?.(r)}
                      onMouseEnter={() => setFocusedIndex(globalIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        background: isFocused ? 'var(--bg-tertiary)' : 'transparent',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-body)',
                      }}
                    >
                      {r.icon && <span style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}>{r.icon}</span>}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: 'var(--font-weight-medium)',
                        }}>
                          {r.label}
                        </div>
                        {r.sublabel && (
                          <div style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--text-tertiary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {r.sublabel}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
