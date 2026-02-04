'use client';

import { CATEGORY_OPTIONS, SEVERITY_OPTIONS } from '@/types/insight';
import { EventFilters } from '@/lib/eventFilters';
import { ChangeEvent, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

type Props = {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
  onClear: () => void;
};

export default function EventFiltersBar({ filters, onChange, onClear }: Props) {
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
        value === '' ? undefined : name === 'page' || name === 'pageSize' || name === 'minScore' ? Number(value) : value,
      page: 1,
    };
    onChange(next);
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-6 md:items-end">
        <div className="md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">Search</label>
          <input
            name="q"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Search title or tags…"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">Category</label>
          <select
            name="category"
            value={filters.category ?? ''}
            onChange={handleInput}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">Severity</label>
          <select
            name="severity"
            value={filters.severity ?? ''}
            onChange={handleInput}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All</option>
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">Date</label>
          <select
            name="days"
            value={filters.days ?? ''}
            onChange={handleInput}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">Min score</label>
          <input
            type="number"
            min={0}
            max={100}
            name="minScore"
            value={filters.minScore ?? ''}
            onChange={handleInput}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="flex gap-2 md:justify-end">
          <button
            onClick={onClear}
            className="mt-5 h-10 rounded-lg border border-border px-3 text-sm text-foreground transition hover:border-accent"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
