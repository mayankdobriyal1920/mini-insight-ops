'use client';

import { InsightEvent } from '@/types/insight';
import { format } from 'date-fns';
import { SeverityBadge } from '../ui/severity-badge';

type Props = {
  data: { items: InsightEvent[]; meta: Record<string, unknown> } | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (sortBy: 'createdAt' | 'severity' | 'score', sortDir: 'asc' | 'desc') => void;
  onRowClick: (event: InsightEvent) => void;
  onEdit: (event: InsightEvent) => void;
  onDelete: (event: InsightEvent) => void;
  canEdit: boolean;
  canDelete: boolean;
  busyId: string | null;
};

export default function EventTable({
  data,
  loading,
  error,
  onRetry,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onRowClick,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  busyId,
}: Props) {
  const sortDir = (data?.meta?.sortDir as 'asc' | 'desc') ?? 'desc';
  const sortBy = (data?.meta?.sortBy as 'createdAt' | 'severity' | 'score') ?? 'createdAt';

  return (
    <div className="rounded-lg border border-border bg-surface shadow-sm">
      {error && (
        <div className="flex items-center justify-between border-b border-border bg-red-950/30 px-4 py-3 text-sm text-red-200">
          <span>{error}</span>
          <button onClick={onRetry} className="underline">
            Retry
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <Th label="Title" />
              <Th label="Category" />
              <Th
                label="Severity"
                sortable
                active={sortBy === 'severity'}
                dir={sortDir}
                onSort={() => toggleSort('severity', sortBy, sortDir, onSortChange)}
              />
              <Th
                label="Score"
                sortable
                active={sortBy === 'score'}
                dir={sortDir}
                onSort={() => toggleSort('score', sortBy, sortDir, onSortChange)}
              />
              <Th label="Confidence" />
              <Th label="Impact" />
              <Th
                label="Created"
                sortable
                active={sortBy === 'createdAt'}
                dir={sortDir}
                onSort={() => toggleSort('createdAt', sortBy, sortDir, onSortChange)}
              />
              <Th label="Tags" />
              <Th label="Actions" />
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>
      {data?.meta && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md border border-border px-3 py-1 transition hover:border-accent disabled:opacity-50"
              onClick={() => onPageChange(Math.max(1, (data.meta.page ?? 1) - 1))}
              disabled={data.meta.page <= 1}
            >
              Previous
            </button>
            <button
              className="rounded-md border border-border px-3 py-1 transition hover:border-accent disabled:opacity-50"
              onClick={() => onPageChange(Math.min(data.meta.totalPages, (data.meta.page ?? 1) + 1))}
              disabled={data.meta.page >= data.meta.totalPages}
            >
              Next
            </button>
            <span>
              Page {data.meta.page} / {data.meta.totalPages}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Page size</span>
            <select
              value={data.meta.pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-2 py-1"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );

  function renderRows() {
    if (loading) return skeletonRows();
    if (!data?.items?.length) {
      return (
        <tr>
          <td colSpan={9} className="px-4 py-8 text-center text-muted">
            No events found.{' '}
            <button onClick={onRetry} className="text-foreground underline">
              Clear filters
            </button>
          </td>
        </tr>
      );
    }

    return data.items.map((evt) => (
      <tr
        key={evt.id}
        className="border-b border-border/60 transition hover:bg-surface-muted"
        onClick={() => onRowClick(evt)}
      >
        <Td>
          <div className="font-semibold text-foreground">{evt.title}</div>
          <div className="text-xs text-muted line-clamp-1">{evt.description}</div>
        </Td>
        <Td>
          <span className="rounded-full bg-surface-muted px-2 py-1 text-xs text-foreground">
            {evt.category}
          </span>
        </Td>
        <Td>
          <SeverityBadge severity={evt.severity} />
        </Td>
        <Td>{evt.metrics.score}</Td>
        <Td>{evt.metrics.confidence.toFixed(2)}</Td>
        <Td>{evt.metrics.impact}</Td>
        <Td>{format(new Date(evt.createdAt), 'MMM d')}</Td>
        <Td>
          <div className="flex flex-wrap gap-1">
            {evt.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md bg-background px-2 py-1 text-[11px] text-muted">
                {tag}
              </span>
            ))}
            {evt.tags.length > 3 && (
              <span className="text-[11px] text-muted">+{evt.tags.length - 3}</span>
            )}
          </div>
        </Td>
        <Td onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => onEdit(evt)}
                className="rounded-md border border-border px-2 py-1 text-xs text-foreground transition hover:border-accent"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(evt)}
                disabled={busyId === evt.id}
                className="rounded-md border border-red-400/60 px-2 py-1 text-xs text-red-200 transition hover:border-red-300 disabled:opacity-60"
              >
                {busyId === evt.id ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>
        </Td>
      </tr>
    ));
  }
}

function Th({
  label,
  sortable,
  active,
  dir,
  onSort,
}: {
  label: string;
  sortable?: boolean;
  active?: boolean;
  dir?: 'asc' | 'desc';
  onSort?: () => void;
}) {
  return (
    <th className="px-4 py-3 text-left">
      <button
        className={`flex items-center gap-1 ${sortable ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={sortable ? onSort : undefined}
      >
        <span>{label}</span>
        {sortable && active && <span className="text-[11px]">{dir === 'asc' ? '↑' : '↓'}</span>}
      </button>
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
}

function toggleSort(
  column: 'createdAt' | 'severity' | 'score',
  current: string,
  dir: 'asc' | 'desc',
  onSort: (col: 'createdAt' | 'severity' | 'score', dir: 'asc' | 'desc') => void,
) {
  if (current === column) {
    onSort(column, dir === 'asc' ? 'desc' : 'asc');
  } else {
    onSort(column, column === 'createdAt' ? 'desc' : 'asc');
  }
}

function skeletonRows() {
  return Array.from({ length: 6 }).map((_, idx) => (
    <tr key={idx} className="border-b border-border/60">
      {Array.from({ length: 9 }).map((__, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full rounded bg-surface-muted" />
        </td>
      ))}
    </tr>
  ));
}
