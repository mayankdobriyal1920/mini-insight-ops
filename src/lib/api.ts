import { InsightEvent } from '@/types/insight';

type ApiError = { code: string; message: string; details?: unknown };

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: ApiError = body?.error ?? { code: 'UNKNOWN', message: 'Request failed' };
    throw new Error(err.message || 'Request failed', { cause: err });
  }
  return body.data as T;
}

export async function apiGetEvents(params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  });
  const res = await fetch(`/api/events?${qs.toString()}`, { cache: 'no-store' });
  return handleResponse<{ items: InsightEvent[]; meta: Record<string, unknown> }>(res);
}

export async function apiCreateEvent(payload: Partial<InsightEvent>) {
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ item: InsightEvent }>(res);
}

export async function apiUpdateEvent(id: string, payload: Partial<InsightEvent>) {
  const res = await fetch(`/api/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ item: InsightEvent }>(res);
}

export async function apiDeleteEvent(id: string) {
  const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
  return handleResponse<{ ok: boolean }>(res);
}

export async function apiExportEvents(params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  });
  const res = await fetch(`/api/events/export?${qs.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: ApiError = body?.error ?? { code: 'UNKNOWN', message: 'Export failed' };
    throw new Error(err.message, { cause: err });
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `insight-events_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function apiGetUsers() {
  const res = await fetch('/api/users', { cache: 'no-store' });
  return handleResponse<{ items: { id: string; email: string; role: string }[] }>(res);
}

export async function apiUpdateUserRole(id: string, role: string) {
  const res = await fetch(`/api/users/${id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  return handleResponse<{ item: { id: string; email: string; role: string } }>(res);
}
