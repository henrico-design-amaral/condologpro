# Admin Data Loading Performance

## Baseline problem

After PR #8, production measurements showed DB-backed operational pages with high response time variance:

- `/`: 29ms to 1727ms;
- `/admin`: 2854ms to 5069ms;
- `/admin/packages`: 1495ms to 1738ms;
- `/admin/residents`: 1629ms to 2049ms;
- `/mobile`: 784ms to 1757ms;
- `/mobile/intake`: 29ms to 298ms;
- `/mobile/pending`: 1591ms to 1824ms.

The strongest signal was not page complexity alone. The slow pages were the pages doing several small database reads over the cloud database path.

## Bottlenecks found

- `/admin` used many independent count queries for KPIs, another query for building activity and another query for recent packages.
- `/mobile` repeated five package count queries for the portaria summary.
- `/admin/packages`, `/admin/residents` and `/mobile/pending` had limits, but still rendered relatively large first pages without page navigation.
- Building activity loaded package rows and grouped them in application memory.
- Existing PR #8 indexes helped single-column filters, but common status/date filters needed composite indexes.

## Query and data changes

- Dashboard KPIs now use one aggregate SQL query per datasource mode.
- Mobile summary now uses one aggregate SQL query.
- Building activity now uses SQL grouping with joins and a limit, instead of application-side grouping.
- Recent package, package list and pending list queries still use Prisma with narrow `select` fields.
- Admin packages now uses page size 50 with `take: 51` overfetch for next-page detection.
- Admin residents now uses page size 60 with `take: 61` overfetch.
- Mobile pending now uses page size 30 with `take: 31` overfetch.
- No stale cache was introduced. Package registration remains visible on fresh requests.

## Schema changes

Indexes added to both `prisma/schema.prisma` and `prisma/schema.supabase.prisma`:

- `Building.label`;
- `Unit.number`;
- `Resident.isActive, Resident.name`;
- `Package.status, Package.receivedAt`;
- `Package.status, Package.pickedUpAt`.

Local SQLite needs `npm run db:push` after this change.

Supabase needs a schema push or equivalent migration after merge/deploy:

```bash
npm run prisma:supabase:push
```

Run that only with real Supabase credentials and after confirming the target project.

## UI changes

- Admin packages, admin residents and mobile pending now show simple previous/next pagination.
- The list headers show the visible range instead of implying that every matching row is rendered.
- Visual style remains aligned with PR #8: compact admin tables, dark mobile portaria screens, readable buttons and `rounded-[8px]` controls.

## Measurement command

Start the production server locally first:

```bash
$env:DATABASE_URL="file:./dev.db"; npm run build
$env:DATABASE_URL="file:./dev.db"; npm run start -- -p 3000
```

Then measure:

```bash
npm run measure:routes
```

Optional environment variables:

```bash
$env:MEASURE_BASE_URL="https://condologpro.vercel.app"
$env:MEASURE_SAMPLES="5"
npm run measure:routes
```

## Remaining risks

- Supabase performance still depends on real project region, cold starts, connection behavior and deployed indexes.
- Raw aggregate SQL is split by datasource mode to preserve SQLite and PostgreSQL compatibility; both schemas must stay aligned.
- Search using `contains` can still be expensive on large datasets. For the pilot size, pagination and existing indexes are enough. Full-text search is intentionally out of scope.
- `/mobile/intake` was not changed because it was already fast and camera behavior should remain stable.

