'use client';

import { useState } from 'react';
import { z } from 'zod';
import { CATEGORY_OPTIONS, InsightEvent, SEVERITY_OPTIONS } from '@/types/insight';
import { apiCreateEvent, apiUpdateEvent } from '@/lib/api';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(CATEGORY_OPTIONS),
  severity: z.enum(SEVERITY_OPTIONS),
  location: z.object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
  }),
  metrics: z.object({
    score: z.coerce.number().min(0).max(100),
    confidence: z.coerce.number().min(0).max(1),
    impact: z.coerce.number().min(0),
  }),
  tags: z.array(z.string().min(1)).min(1),
});

type Props = {
  mode: 'create' | 'edit';
  event?: InsightEvent;
  onClose: () => void;
  onSuccess: (event: InsightEvent) => void;
};

export default function EventFormModal({ mode, event, onClose, onSuccess }: Props) {
  const [form, setForm] = useState(() => ({
    title: event?.title ?? '',
    description: event?.description ?? '',
    category: event?.category ?? 'Ops',
    severity: event?.severity ?? 'Medium',
    location: { lat: event?.location.lat ?? 0, lng: event?.location.lng ?? 0 },
    metrics: {
      score: event?.metrics.score ?? 50,
      confidence: event?.metrics.confidence ?? 0.8,
      impact: event?.metrics.impact ?? 100,
    },
    tags: event?.tags ?? ['incident'],
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const payload = parsed.data;
      const result =
        mode === 'create'
          ? await apiCreateEvent(payload)
          : await apiUpdateEvent(event!.id, payload);
      onSuccess(result.item);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (path: string, value: unknown) => {
    setForm((prev) => {
      const next = structuredClone(prev) as Record<string, unknown>;
      const parts = path.split('.');
      let cursor = next as Record<string, unknown>;
      for (let i = 0; i < parts.length - 1; i += 1) {
        cursor = cursor[parts[i]] as Record<string, unknown>;
      }
      cursor[parts[parts.length - 1]] = value;
      return next as typeof prev;
    });
  };

  const updateTags = (value: string) => {
    const tags = value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setForm((prev) => ({ ...prev, tags }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              {mode === 'create' ? 'New event' : 'Edit event'}
            </p>
            <h2 className="text-xl font-semibold text-foreground">
              {mode === 'create' ? 'Create Event' : 'Edit Event'}
            </h2>
          </div>
          <button onClick={onClose} className="text-sm text-muted hover:text-foreground">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField
            label="Title"
            value={form.title}
            onChange={(v) => updateField('title', v)}
            error={errors['title']}
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(v) => updateField('description', v)}
            error={errors['description']}
          />
          <SelectField
            label="Category"
            value={form.category}
            options={CATEGORY_OPTIONS}
            onChange={(v) => updateField('category', v)}
          />
          <SelectField
            label="Severity"
            value={form.severity}
            options={SEVERITY_OPTIONS}
            onChange={(v) => updateField('severity', v)}
          />
          <NumberField
            label="Latitude"
            value={form.location.lat}
            onChange={(v) => updateField('location.lat', v)}
            error={errors['location.lat']}
          />
          <NumberField
            label="Longitude"
            value={form.location.lng}
            onChange={(v) => updateField('location.lng', v)}
            error={errors['location.lng']}
          />
          <NumberField
            label="Score"
            value={form.metrics.score}
            min={0}
            max={100}
            onChange={(v) => updateField('metrics.score', v)}
            error={errors['metrics.score']}
          />
          <NumberField
            label="Confidence"
            value={form.metrics.confidence}
            step={0.01}
            min={0}
            max={1}
            onChange={(v) => updateField('metrics.confidence', v)}
            error={errors['metrics.confidence']}
          />
          <NumberField
            label="Impact"
            value={form.metrics.impact}
            min={0}
            onChange={(v) => updateField('metrics.impact', v)}
            error={errors['metrics.impact']}
          />
          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">Tags</label>
            <input
              value={form.tags.join(', ')}
              onChange={(e) => updateTags(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              placeholder="e.g. latency, incident, queue"
            />
            <p className="text-xs text-muted">Comma separated</p>
            {errors['tags'] && <p className="text-xs text-red-300">{errors['tags']}</p>}
          </div>
          {apiError && (
            <div className="md:col-span-2 rounded-lg border border-red-400/60 bg-red-950/30 px-3 py-2 text-sm text-red-100">
              {apiError}
            </div>
          )}
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-foreground transition hover:border-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface transition hover:bg-accent-strong disabled:opacity-60"
            >
              {submitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  error,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
