## Mini InsightOps

Next.js 14 (App Router) demo for operational visibility: map, events, dashboard, and RBAC-managed users. Auth is mocked with sessions and an in-memory store.

### Setup
1) `npm install`
2) `npm run dev`
3) Open http://localhost:3000

### Test users
- admin@test.com / password (Admin)
- analyst@test.com / password (Analyst)
- viewer@test.com / password (Viewer)

### Routes
- `/login` – sign in
- `/map` – map + list + detail drawer (URL-synced filters)
- `/events` – table with filters/sort/pagination, create/edit/delete, CSV export
- `/dashboard` – charts + computed insights (filter-aware)
- `/users` – Admin-only role management

### API (mocked, in-memory)
- Auth: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Events: `/api/events` (GET/POST), `/api/events/[id]` (GET/PUT/DELETE), `/api/events/export` (CSV)
- Users: `/api/users` (GET), `/api/users/[id]/role` (PATCH)

### Tradeoffs
- In-memory data + sessions (no persistence)
- Mock auth + hardcoded users
- Leaflet/Recharts for visuals; not tuned for very large datasets

### Filters
Filters are URL-synced across map/events/dashboard: `q, category, severity, days, minScore, sortBy, sortDir, page, pageSize`.

### QA checklist
- Auth: login works for all 3 users; refresh keeps session; logout clears session.
- RBAC server-side: Viewer blocked on POST/PUT/DELETE events; Analyst blocked on DELETE; non-admin blocked on users endpoints.
- Filtering: same params affect /events, /map, /dashboard consistently.
- Dashboard insights: high severity delta handles prev7=0 safely.
- Users: admin can change other roles; cannot change own role; non-admin sees not-authorized state.
