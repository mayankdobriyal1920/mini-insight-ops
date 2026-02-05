export type Category = 'Fraud' | 'Ops' | 'Safety' | 'Sales' | 'Health';
export type Severity = 'Low' | 'Medium' | 'High';
export type Role = 'Admin' | 'Analyst' | 'Viewer';

export interface InsightEvent {
  id: string;
  title: string;
  description: string;
  category: Category;
  severity: Severity;
  createdAt: string;
  location: { lat: number; lng: number };
  metrics: { score: number; confidence: number; impact: number };
  tags: string[];
}

export const SEVERITY_ORDER: Record<Severity, number> = { High: 3, Medium: 2, Low: 1 };

export const CATEGORY_OPTIONS: Category[] = ['Fraud', 'Ops', 'Safety', 'Sales', 'Health'];
export const SEVERITY_OPTIONS: Severity[] = ['Low', 'Medium', 'High'];

export type EventListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  sortBy?: 'createdAt' | 'severity' | 'score';
  sortDir?: 'asc' | 'desc';
};

export type EventListResponse = { items: InsightEvent[]; meta: EventListMeta };
