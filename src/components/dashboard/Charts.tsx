'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';

type Props = {
  loading: boolean;
  categoryData: { name: string; count: number }[];
  severityData: { name: string; count: number }[];
  trendData: { date: string; count: number }[];
};

const severityColors: Record<string, string> = {
  High: '#f97316',
  Medium: '#facc15',
  Low: '#22c55e',
};

export default function Charts({ loading, categoryData, severityData, trendData }: Props) {
  const skeleton = (
    <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-surface-muted text-muted">
      Loading…
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-5 space-y-4">
        <ChartCard title="Events by category">
          {loading ? skeleton : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Events by severity">
          {loading ? skeleton : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Pie data={severityData} dataKey="count" nameKey="name" outerRadius={80} label>
                  {severityData.map((entry) => (
                    <Cell key={entry.name} fill={severityColors[entry.name] ?? '#22d3ee'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="lg:col-span-7">
        <ChartCard title="Trend over time">
          {loading ? skeleton : (
            <ResponsiveContainer width="100%" height={520}>
              <LineChart data={trendData} margin={{ left: 0, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#22d3ee' }}
                  activeDot={{ r: 5, fill: '#22d3ee' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <p className="mb-2 text-sm font-semibold text-foreground">{title}</p>
      {children}
    </div>
  );
}

const tooltipStyle = {
  background: '#0f172a',
  border: '1px solid #1f2a44',
  borderRadius: 12,
  color: '#e2e8f0',
};
