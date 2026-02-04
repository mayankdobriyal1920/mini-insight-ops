'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User } from '@/types/user';
import { can } from '@/lib/rbac-ui';
import { EventFilters, parseFiltersFromSearchParams, serializeFiltersToQuery } from '@/lib/eventFilters';
import { apiDeleteEvent, apiGetEvents } from '@/lib/api';
import { apiExportEvents } from '@/lib/api';
import { InsightEvent } from '@/types/insight';
import EventFiltersBar from '@/components/events/EventFilters';
import EventTable from '@/components/events/EventTable';
import EventFormModal from '@/components/events/EventFormModal';
import EventDetailsModal from '@/components/events/EventDetailsModal';

type Props = { user: User | null };

export default function EventsPageClient({ user }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<EventFilters>(() =>
    parseFiltersFromSearchParams(new URLSearchParams(searchParams)),
  );
  const [data, setData] = useState<{ items: InsightEvent[]; meta: Record<string, unknown> } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<{ mode: 'create' | 'edit'; event?: InsightEvent } | null>(
    null,
  );
  const [detail, setDetail] = useState<InsightEvent | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const canCreate = can(user, 'events:create');
  const canUpdate = can(user, 'events:update');
  const canDelete = can(user, 'events:delete');

  // sync filters from URL
  useEffect(() => {
    const nextFilters = parseFiltersFromSearchParams(new URLSearchParams(searchParams));
    setFilters(nextFilters);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiGetEvents(filtersToParams(filters))
      .then((res) => {
        if (cancelled) return;
        setData(res);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const updateFilters = (next: EventFilters) => {
    const qs = serializeFiltersToQuery(next);
    router.replace(qs ? `/events?${qs}` : '/events');
  };

  const handleDelete = async (event: InsightEvent) => {
    if (!canDelete) return;
    setBusyId(event.id);
    try {
      await apiDeleteEvent(event.id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((i) => i.id !== event.id),
              meta: { ...prev.meta, total: prev.meta.total - 1 },
            }
          : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Events</h1>
          <p className="text-sm text-muted">Track anomalies, suppress noise, and assign owners.</p>
        </div>
        {canCreate && (
          <button
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface transition hover:bg-accent-strong"
            onClick={() => setShowForm({ mode: 'create' })}
          >
            Create event
          </button>
        )}
      </div>

      <EventFiltersBar filters={filters} onChange={updateFilters} onClear={() => updateFilters({})} />
      <div className="flex justify-end">
        <button
          className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:border-accent"
          onClick={() => apiExportEvents(filtersToParams(filters))}
        >
          Export CSV
        </button>
      </div>

      <EventTable
        data={data}
        loading={loading}
        error={error}
        onRetry={() => updateFilters(filters)}
        onPageChange={(page) => updateFilters({ ...filters, page })}
        onPageSizeChange={(pageSize) => updateFilters({ ...filters, page: 1, pageSize })}
        onSortChange={(sortBy, sortDir) => updateFilters({ ...filters, sortBy, sortDir })}
        onRowClick={setDetail}
        onEdit={(evt) => setShowForm({ mode: 'edit', event: evt })}
        onDelete={handleDelete}
        canEdit={canUpdate}
        canDelete={canDelete}
        busyId={busyId}
      />

      {showForm && (
        <EventFormModal
          mode={showForm.mode}
          event={showForm.event}
          onClose={() => setShowForm(null)}
          onSuccess={(evt) => {
            setShowForm(null);
            setData((prev) =>
              prev
                ? showForm.mode === 'create'
                  ? { ...prev, items: [evt, ...prev.items], meta: { ...prev.meta } }
                  : {
                      ...prev,
                      items: prev.items.map((i) => (i.id === evt.id ? evt : i)),
                      meta: { ...prev.meta },
                    }
                : prev,
            );
          }}
        />
      )}

      {detail && <EventDetailsModal event={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function filtersToParams(filters: EventFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Record<string, string | number>;
}
