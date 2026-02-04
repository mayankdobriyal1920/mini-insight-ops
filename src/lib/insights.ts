import { InsightEvent } from '@/types/insight';

export function groupByCategory(events: InsightEvent[]) {
  const map = new Map<string, number>();
  events.forEach((evt) => map.set(evt.category, (map.get(evt.category) ?? 0) + 1));
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}

export function groupBySeverity(events: InsightEvent[]) {
  const map = new Map<string, number>();
  events.forEach((evt) => map.set(evt.severity, (map.get(evt.severity) ?? 0) + 1));
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}

export function trendByDay(events: InsightEvent[], windowDays?: number) {
  const days = windowDays ?? 14;
  const now = Date.now();
  const start = now - days * 24 * 60 * 60 * 1000;
  const map = new Map<string, number>();

  events
    .filter((e) => new Date(e.createdAt).getTime() >= start)
    .forEach((evt) => {
      const day = evt.createdAt.slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + 1);
    });

  const dates: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dates.push({ date: key, count: map.get(key) ?? 0 });
  }
  return dates;
}

export function computeInsights(events: InsightEvent[], now: Date) {
  const insights: string[] = [];

  // A) High severity change vs previous 7 days
  const nowTs = now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const currentWindowStart = nowTs - 7 * dayMs;
  const prevWindowStart = nowTs - 14 * dayMs;

  const isHigh = (e: InsightEvent) => e.severity === 'High';
  const inRange = (e: InsightEvent, start: number, end: number) => {
    const ts = new Date(e.createdAt).getTime();
    return ts >= start && ts < end;
  };

  const current7 = events.filter((e) => isHigh(e) && inRange(e, currentWindowStart, nowTs)).length;
  const prev7 = events.filter((e) => isHigh(e) && inRange(e, prevWindowStart, currentWindowStart)).length;

  if (prev7 === 0) {
    if (current7 === 0) {
      insights.push('High severity events unchanged vs previous 7 days (0).');
    } else {
      insights.push('High severity events increased (none in the previous 7 days).');
    }
  } else {
    const pct = Math.round(((current7 - prev7) / prev7) * 100);
    const sign = pct > 0 ? '+' : '';
    insights.push(`High severity events ${sign}${pct}% vs previous 7 days.`);
  }

  // B) Top category this week
  const weekStart = nowTs - 7 * dayMs;
  const catMap = new Map<string, number>();
  events
    .filter((e) => new Date(e.createdAt).getTime() >= weekStart)
    .forEach((e) => catMap.set(e.category, (catMap.get(e.category) ?? 0) + 1));
  if (catMap.size === 0) {
    insights.push('No category activity in the last 7 days.');
  } else {
    const [topCat, count] = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])[0];
    insights.push(`Top category this week: ${topCat} (${count}).`);
  }

  // C) Highest impact event
  if (events.length) {
    const topImpact = events.reduce((max, e) =>
      e.metrics.impact > max.metrics.impact ? e : max,
    );
    insights.push(`Highest impact: ${topImpact.title} (impact ${topImpact.metrics.impact}).`);
  } else {
    insights.push('No events in scope to compute impact.');
  }

  return insights;
}
