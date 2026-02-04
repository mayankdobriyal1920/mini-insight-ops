import { Category, Severity } from '@/types/insight';

export type EventFilters = {
  q?: string;
  category?: Category;
  severity?: Severity;
  days?: 7 | 30;
  minScore?: number;
  sortBy?: 'createdAt' | 'severity' | 'score';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
};

export function parseFiltersFromSearchParams(searchParams: URLSearchParams): EventFilters {
  const toNum = (v: string | null) => (v ? Number(v) : undefined);
  const daysVal = toNum(searchParams.get('days'));
  return {
    q: orU(searchParams.get('q')),
    category: orU(searchParams.get('category')) as Category | undefined,
    severity: orU(searchParams.get('severity')) as Severity | undefined,
    days: daysVal === 7 || daysVal === 30 ? daysVal : undefined,
    minScore: toNum(searchParams.get('minScore')),
    sortBy: (searchParams.get('sortBy') as EventFilters['sortBy']) ?? 'createdAt',
    sortDir: (searchParams.get('sortDir') as EventFilters['sortDir']) ?? 'desc',
    page: toNum(searchParams.get('page')) ?? 1,
    pageSize: toNum(searchParams.get('pageSize')) ?? 10,
  };
}

export function serializeFiltersToQuery(filters: EventFilters) {
  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    qs.set(key, String(value));
  });
  return qs.toString();
}

function orU(val: string | null) {
  return val === null || val === '' ? undefined : val;
}
