'use client';

import { InsightEvent } from '@/types/insight';
import { format } from 'date-fns';
import { SeverityBadge } from '../ui/severity-badge';
import Link from 'next/link';

type Props = { event: InsightEvent; onClose: () => void };

export default function EventDetailsPanel({ event, onClose }: Props) {
  return (
    <div className="flex h-full flex-col gap-3 border-l border-border bg-surface px-4 py-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Event</p>
          <h2 className="text-lg font-semibold text-foreground">{event.title}</h2>
          <p className="text-xs text-muted">{format(new Date(event.createdAt), 'PPpp')}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md border border-border px-2 py-1 text-xs text-foreground transition hover:border-accent"
        >
          Close
        </button>
      </div>
      <SeverityBadge severity={event.severity} />
      <p className="text-sm text-muted">{event.description}</p>
      <div className="text-xs text-muted">
        <span className="rounded-full bg-surface-muted px-2 py-1 text-xs text-foreground">
          {event.category}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Metric label="Score" value={event.metrics.score} />
        <Metric label="Confidence" value={event.metrics.confidence.toFixed(2)} />
        <Metric label="Impact" value={event.metrics.impact} />
        <Metric label="Lat" value={event.location.lat.toFixed(4)} />
        <Metric label="Lng" value={event.location.lng.toFixed(4)} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">Tags</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {event.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-background px-2 py-1 text-[11px] text-foreground border border-border">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <Link
        href={`/events?q=${encodeURIComponent(event.title)}`}
        className="text-sm text-accent underline underline-offset-4"
      >
        Open in Events
      </Link>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
