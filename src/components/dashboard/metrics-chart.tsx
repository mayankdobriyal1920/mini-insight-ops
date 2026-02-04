'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = [
  { name: 'Mon', signals: 14, incidents: 2 },
  { name: 'Tue', signals: 18, incidents: 3 },
  { name: 'Wed', signals: 22, incidents: 4 },
  { name: 'Thu', signals: 19, incidents: 2 },
  { name: 'Fri', signals: 24, incidents: 5 },
  { name: 'Sat', signals: 16, incidents: 2 },
  { name: 'Sun', signals: 12, incidents: 1 },
];

export function MetricsChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="signals" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="incidents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1f2a44', borderRadius: 12 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Area
            type="monotone"
            dataKey="signals"
            stroke="#22d3ee"
            fillOpacity={1}
            fill="url(#signals)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="incidents"
            stroke="#f97316"
            fillOpacity={1}
            fill="url(#incidents)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
