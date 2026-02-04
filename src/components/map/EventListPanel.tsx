'use client';

import { EventFilters } from '@/lib/eventFilters';
import { CATEGORY_OPTIONS, InsightEvent, SEVERITY_OPTIONS } from '@/types/insight';
import { format } from 'date-fns';
import { ChangeEvent, useEffect, useState } from 'react';
import { SeverityBadge } from '../ui/severity-badge';
import { useDebounce } from '@/hooks/use-debounce';

type Props = {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
  events: InsightEvent[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelect: (event: InsightEvent) => void;
  selectedId?: string | null;
};

export default function EventListPanel({
  filters,
  onChange,
  events,
  loading,
  error,
  onRetry,
  onSelect,
  selectedId,
}: Props) {
  const [localQ, setLocalQ] = useState(filters.q ?? '');
  const debouncedQ = useDebounce(localQ, 300);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalQ(filters.q ?? '');
  }, [filters.q]);

  useEffect(() => {
    if (debouncedQ !== filters.q) {
      onChange({ ...filters, q: debouncedQ || undefined, page: 1 });
    }
  }, [debouncedQ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const next = {
      ...filters,
      [name]:
        value === ''
          ? undefined
          : name === 'minScore'
            ? Number(value)
            : name === 'days'
              ? Number(value)
              : value,
    };
    onChange(next);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Events</p>
          <p className="text-sm text-muted">Filtered view</p>
        </div>
        <button
          onClick={() => onChange({})}
          className="rounded-lg border border-border px-3 py-1 text-xs text-foreground transition hover:border-accent"
        >
          Clear
        </button>
      </div>
      <div className="space-y-2">
        <input
          name="q"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder="Search title or tags…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            name="category"
            value={filters.category ?? ''}
            onChange={handleInput}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            name="severity"
            value={filters.severity ?? ''}
            onChange={handleInput}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All severity</option>
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            name="days"
            value={filters.days ?? ''}
            onChange={handleInput}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <input
            type="number"
            name="minScore"
            min={0}
            max={100}
            value={filters.minScore ?? ''}
            onChange={handleInput}
            placeholder="Min score"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-400/70 bg-red-950/40 px-3 py-2 text-sm text-red-100">
          {error}{' '}
          <button className="underline" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      <div className="mt-4 max-h-[480px] space-y-2 overflow-y-auto pr-1">
        {loading
          ? Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-lg border border-border bg-surface-muted p-3"
              >
                <div className="h-4 w-2/3 rounded bg-background" />
                <div className="mt-2 h-3 w-1/2 rounded bg-background" />
              </div>
            ))
          : events.length === 0
            ? (
                <div className="rounded-lg border border-dashed border-border bg-surface-muted p-4 text-center text-sm text-muted">
                  No events found.
                  <div>
                    <button
                      onClick={() => onChange({})}
                      className="text-foreground underline decoration-accent decoration-2 underline-offset-4"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              )
            : events.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => onSelect(evt)}
                  className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                    selectedId === evt.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-surface hover:border-accent/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground line-clamp-1">
                      {evt.title}
                    </div>
                    <SeverityBadge severity={evt.severity} />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <span className="rounded-full bg-surface-muted px-2 py-1">{evt.category}</span>
                    <span>Score {evt.metrics.score}</span>
                    <span>{format(new Date(evt.createdAt), 'MMM d')}</span>
                  </div>
                </button>
              ))}
      </div>
    </div>
  );
}
