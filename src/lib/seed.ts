import { InsightEvent, Category, CATEGORY_OPTIONS, SEVERITY_OPTIONS } from '@/types/insight';

type City = { name: string; lat: number; lng: number };

export const cityCatalog: City[] = [
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
];

// Mulberry32 deterministic RNG
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const categoryTags: Record<Category, string[]> = {
  Fraud: ['chargeback', 'card', 'abuse', 'kyc', 'anomaly'],
  Ops: ['latency', 'throughput', 'incident', 'ops', 'pipeline'],
  Safety: ['safety', 'incident', 'policy', 'alert', 'moderation'],
  Sales: ['conversion', 'lead', 'pipeline', 'deal', 'crm'],
  Health: ['vitals', 'device', 'clinic', 'reporting', 'triage'],
};

const categoryTitles: Record<Category, string[]> = {
  Fraud: ['Chargeback spike', 'Multiple failed OTPs', 'Unusual refund rate', 'Velocity alert'],
  Ops: ['Ingress latency', 'Queue backlog', 'Worker restart', 'Data sync delayed'],
  Safety: ['Content violation', 'Policy breach flagged', 'Abuse report surge', 'Escalation queue'],
  Sales: ['Lead drop-off', 'Campaign anomaly', 'Checkout conversion dip', 'High-value lead'],
  Health: ['Device offline', 'Vitals drift', 'Report delay', 'Remote triage needed'],
};

const categoryDescriptions: Record<Category, string[]> = {
  Fraud: [
    'Detected increase in chargeback patterns from a single BIN range.',
    'High velocity of OTP failures indicating possible credential stuffing.',
  ],
  Ops: [
    'P99 latency elevated on ingestion pipeline affecting live dashboards.',
    'Background workers restarting due to memory pressure on node pool.',
  ],
  Safety: [
    'Spike in user reports for harassment across multiple channels.',
    'Automated policy breach detection triggered for uploaded content.',
  ],
  Sales: [
    'Observed decline in checkout conversion for mobile traffic segment.',
    'Leads from new campaign show higher drop-off at qualification stage.',
  ],
  Health: [
    'Wearable devices reporting stale vitals beyond SLA.',
    'Clinical report ingestion delayed; notify care team.',
  ],
};

function pick<T>(arr: T[], rand: () => number) {
  return arr[Math.floor(rand() * arr.length)];
}

function randomBetween(min: number, max: number, rand: () => number) {
  return Math.round((min + (max - min) * rand()) * 100) / 100;
}

export function seedEvents(count = 40): InsightEvent[] {
  const rand = mulberry32(123456);
  const events: InsightEvent[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i += 1) {
    const category = pick(CATEGORY_OPTIONS, rand);
    const severity = pick(SEVERITY_OPTIONS, rand);
    const city = pick(cityCatalog, rand);
    const title = pick(categoryTitles[category], rand);
    const description = pick(categoryDescriptions[category], rand);
    const createdAt = new Date(now - Math.floor(rand() * 30) * 24 * 60 * 60 * 1000).toISOString();
    const tags = Array.from(
      new Set(
        Array.from({ length: 1 + Math.floor(rand() * 4) }).map(() => pick(categoryTags[category], rand)),
      ),
    );

    const score = Math.round(randomBetween(20, 95, rand));
    const confidence = Math.round(randomBetween(0.4, 0.95, rand) * 100) / 100;
    const impact = Math.round(randomBetween(20, 500, rand));

    events.push({
      id: `evt-${i + 1}`,
      title,
      description,
      category,
      severity,
      createdAt,
      location: { lat: city.lat + rand() * 0.05, lng: city.lng + rand() * 0.05 },
      metrics: { score, confidence, impact },
      tags,
    });
  }

  return events;
}
