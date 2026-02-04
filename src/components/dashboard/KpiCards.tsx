type Props = {
  loading: boolean;
  total: number;
  highCount: number;
  avgScore: number;
};

export default function KpiCards({ loading, total, highCount, avgScore }: Props) {
  const cards = [
    { label: 'Total events', value: total },
    { label: 'High severity', value: highCount },
    { label: 'Avg score', value: isNaN(avgScore) ? 0 : avgScore },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-surface p-4 shadow-sm"
        >
          <p className="text-sm text-muted">{card.label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded bg-surface-muted" />
          ) : (
            <p className="text-3xl font-semibold text-foreground">{card.value}</p>
          )}
        </div>
      ))}
    </div>
  );
}
