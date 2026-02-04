'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User } from '@/types/user';
import { EventFilters, parseFiltersFromSearchParams, serializeFiltersToQuery } from '@/lib/eventFilters';
import { apiGetEvents } from '@/lib/api';
import { InsightEvent } from '@/types/insight';
import EventFiltersBar from '@/components/events/EventFilters';
import KpiCards from '@/components/dashboard/KpiCards';
import Charts from '@/components/dashboard/Charts';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import { groupByCategory, groupBySeverity, trendByDay, computeInsights } from '@/lib/insights';

type Props = { user: User | null };

export default function DashboardPageClient({ user }: Props) {
  void user;
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFiltersFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const [events, setEvents] = useState<InsightEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = useMemo(() => serializeFiltersToQuery(filters), [filters]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiGetEvents({ ...filtersToParams(filters), pageSize: 500 });
        if (cancelled) return;
        setEvents(res.items ?? []);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [filters, filtersKey]); // only refetch when query string changes

  const updateFilters = (next: EventFilters) => {
    const qs = serializeFiltersToQuery(next);
    router.replace(qs ? `/dashboard?${qs}` : '/dashboard');
  };

  const categoryData = useMemo(() => groupByCategory(events), [events]);
  const severityData = useMemo(() => groupBySeverity(events), [events]);
  const trendData = useMemo(() => trendByDay(events, filters.days ?? 14), [events, filters.days]);
  const insights = useMemo(() => computeInsights(events, new Date()), [events]);

  const total = events.length;
  const highCount = events.filter((e) => e.severity === 'High').length;
  const avgScore =
    events.length === 0
      ? 0
      : Math.round((events.reduce((sum, e) => sum + e.metrics.score, 0) / events.length) * 10) / 10;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted">Filtered insight across events.</p>
        </div>
      </div>

      <EventFiltersBar filters={filters} onChange={updateFilters} onClear={() => updateFilters({})} />

      {error && (
        <div className="rounded-lg border border-red-400/70 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}{' '}
          <button className="underline" onClick={() => updateFilters(filters)}>
            Retry
          </button>
        </div>
      )}

      <KpiCards loading={loading} total={total} highCount={highCount} avgScore={avgScore} />

      {total === 0 && !loading ? (
        <div className="rounded-lg border border-dashed border-border bg-surface-muted px-6 py-8 text-center text-sm text-muted">
          No events match your filters.
          <div>
            <button
              onClick={() => updateFilters({})}
              className="text-foreground underline decoration-accent decoration-2 underline-offset-4"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <Charts
          loading={loading}
          categoryData={categoryData}
          severityData={severityData}
          trendData={trendData}
        />
      )}

      <InsightsPanel loading={loading} insights={insights} />
    </div>
  );
}

function filtersToParams(filters: EventFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Record<string, string | number>;
}
