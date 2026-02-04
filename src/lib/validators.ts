import { z } from 'zod';
import { CATEGORY_OPTIONS, SEVERITY_OPTIONS } from '@/types/insight';

export const InsightEventCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(CATEGORY_OPTIONS),
  severity: z.enum(SEVERITY_OPTIONS),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  metrics: z.object({
    score: z.number().min(0).max(100),
    confidence: z.number().min(0).max(1),
    impact: z.number().min(0),
  }),
  tags: z.array(z.string().min(1)).min(1),
});

export const InsightEventUpdateSchema = InsightEventCreateSchema.partial();

export const EventQuerySchema = z.object({
  q: z.string().optional(),
  category: z.enum(CATEGORY_OPTIONS).optional(),
  severity: z.enum(SEVERITY_OPTIONS).optional(),
  minScore: z.number().min(0).max(100).optional(),
  days: z.union([z.literal(7), z.literal(30)]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['createdAt', 'score', 'severity']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(500).optional(),
});
