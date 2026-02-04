'use client';

import { InsightEvent } from '@/types/insight';
import { format } from 'date-fns';

type Props = { event: InsightEvent; onClose: () => void };

export default function EventDetailsModal({ event, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Event detail</p>
            <h2 className="text-xl font-semibold text-foreground">{event.title}</h2>
            <p className="text-xs text-muted">{format(new Date(event.createdAt), 'PPpp')}</p>
          </div>
          <button onClick={onClose} className="text-sm text-muted hover:text-foreground">
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-muted">
          <p className="text-foreground">{event.description}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge>{event.category}</Badge>
            <Badge>{event.severity}</Badge>
            <Badge>Score {event.metrics.score}</Badge>
            <Badge>Impact {event.metrics.impact}</Badge>
            <Badge>Confidence {event.metrics.confidence}</Badge>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Tags</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {event.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Latitude</p>
              <p className="text-foreground">{event.location.lat.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Longitude</p>
              <p className="text-foreground">{event.location.lng.toFixed(4)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-background px-2 py-1 text-[11px] text-foreground border border-border">
      {children}
    </span>
  );
}
