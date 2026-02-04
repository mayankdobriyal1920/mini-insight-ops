import { InsightEvent } from '@/types/insight';

const tone: Record<InsightEvent['severity'], string> = {
  High: 'bg-red-500/20 text-red-200 border border-red-400/50',
  Medium: 'bg-amber-500/20 text-amber-200 border border-amber-400/40',
  Low: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40',
};

export function SeverityBadge({ severity }: { severity: InsightEvent['severity'] }) {
  return (
    <span className={`rounded-full px-2 py-1 text-[12px] font-semibold ${tone[severity]}`}>
      {severity}
    </span>
  );
}
