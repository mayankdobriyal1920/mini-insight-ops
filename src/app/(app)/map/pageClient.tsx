'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User } from '@/types/user';
import { EventFilters, parseFiltersFromSearchParams, serializeFiltersToQuery } from '@/lib/eventFilters';
import { apiGetEvents } from '@/lib/api';
import { InsightEvent } from '@/types/insight';
import EventListPanel from '@/components/map/EventListPanel';
import EventDetailsPanel from '@/components/map/EventDetailsPanel';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-surface text-muted">
      Loading map…
    </div>
  ),
});

type Props = { user: User | null };

export default function MapPageClient({ user }: Props) {
  void user;
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFiltersFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const [events, setEvents] = useState<InsightEvent[]>([]);
  const [selected, setSelected] = useState<InsightEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = useMemo(() => serializeFiltersToQuery(filters), [filters]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiGetEvents({ ...filtersToParams(filters), pageSize: 200 });
        if (cancelled) return;
        setEvents(res.items ?? []);
        if (res.items?.length) {
          setSelected((prev) => prev && res.items.find((e) => e.id === prev.id) ? prev : res.items[0]);
        } else {
          setSelected(null);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const updateFilters = (next: EventFilters) => {
    const qs = serializeFiltersToQuery(next);
    router.replace(qs ? `/map?${qs}` : '/map');
  };

  const selectedId = selected?.id;
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedId) ?? null,
    [events, selectedId],
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="w-full max-w-md flex-shrink-0 space-y-3">
        <header>
          <h1 className="text-2xl font-semibold text-foreground">Map</h1>
          <p className="text-sm text-muted">See events in spatial context.</p>
        </header>
        <EventListPanel
          filters={filters}
          onChange={updateFilters}
          events={events}
          loading={loading}
          error={error}
          onRetry={() => updateFilters(filters)}
          onSelect={setSelected}
          selectedId={selectedId}
        />
      </div>
      <div className="relative flex min-h-[540px] flex-1 overflow-hidden rounded-xl border border-border bg-surface">
        <MapView
          events={events}
          loading={loading}
          selectedId={selectedId}
          onSelect={setSelected}
          filtersKey={filtersKey}
        />
        {selectedEvent && (
          <div className="hidden w-96 border-l border-border bg-surface md:block">
            <EventDetailsPanel event={selectedEvent} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>
    </div>
  );
}

function filtersToParams(filters: EventFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Record<string, string | number>;
}
