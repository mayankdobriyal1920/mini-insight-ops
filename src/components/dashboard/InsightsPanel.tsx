'use client';

type Props = {
  loading: boolean;
  insights: string[];
};

export default function InsightsPanel({ loading, insights }: Props) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <p className="text-sm font-semibold text-foreground">Insights</p>
      {loading ? (
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-3/4 animate-pulse rounded bg-surface-muted" />
          ))}
        </div>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-muted">
          {insights.map((item, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
              <span className="text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
