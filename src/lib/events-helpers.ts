import { ParsedEventQuery } from './query';
import { InsightEvent, SEVERITY_ORDER } from '@/types/insight';

export function applyFilters(events: InsightEvent[], query: ParsedEventQuery) {
  return events.filter((event) => {
    if (query.q) {
      const q = query.q.toLowerCase();
      const inTitle = event.title.toLowerCase().includes(q);
      const inTags = event.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!inTitle && !inTags) return false;
    }

    if (query.category && event.category !== query.category) return false;
    if (query.severity && event.severity !== query.severity) return false;
    if (query.minScore !== undefined && event.metrics.score < query.minScore) return false;

    const eventDate = new Date(event.createdAt).getTime();
    if (query.days) {
      const cutoff = Date.now() - query.days * 24 * 60 * 60 * 1000;
      if (eventDate < cutoff) return false;
    } else if (query.startDate || query.endDate) {
      if (query.startDate) {
        const start = new Date(query.startDate).getTime();
        if (Number.isFinite(start) && eventDate < start) return false;
      }
      if (query.endDate) {
        const end = new Date(query.endDate).getTime();
        if (Number.isFinite(end) && eventDate > end) return false;
      }
    }

    return true;
  });
}

export function applySort(events: InsightEvent[], query: ParsedEventQuery) {
  const sortBy = query.sortBy ?? 'createdAt';
  const dir = query.sortDir ?? 'desc';
  const factor = dir === 'asc' ? 1 : -1;

  return [...events].sort((a, b) => {
    if (sortBy === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * factor;
    }
    if (sortBy === 'severity') {
      return (SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]) * factor;
    }
    if (sortBy === 'score') {
      return (a.metrics.score - b.metrics.score) * factor;
    }
    return 0;
  });
}

export function paginate(events: InsightEvent[], page: number, pageSize: number) {
  const total = events.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  const items = events.slice(start, start + pageSize);

  return {
    items,
    meta: {
      page: currentPage,
      pageSize,
      total,
      totalPages,
    },
  };
}
