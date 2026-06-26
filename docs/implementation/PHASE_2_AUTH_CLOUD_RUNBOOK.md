# Phase 2 Auth and Cloud Foundation Runbook

Status: implementation runbook. No production deployment is part of this phase.

## Security model

- Supabase Auth provides email/password identity. Public signup must be disabled in the Supabase project.
- `Operator.authSubject` stores the immutable Auth user ID (`sub`). An Auth user without an active linked operator is denied.
- `organizationId` and role always come from the server-side operator record.
- Browser code uses only the Supabase publishable key. Prisma and the Storage service role remain server-only.
- Operational tables are not available through PostgREST to `anon` or `authenticated`.
- Label photos use the private `package-labels` bucket and paths under `organizations/{organizationId}/labels/`.

`authSubject` is nullable during this expand step so an existing database can migrate without inventing Auth identities. Null operators cannot authenticate. After every real operator is linked and verified, a separate contract migration must add `NOT NULL`.

## Environment matrix

| Variable | Local fallback | Preview | Production |
| --- | --- | --- | --- |
| `DATABASE_URL` | SQLite file | preview pooler | production pooler |
| `DIRECT_URL` | unset | preview direct URL | production direct URL |
| `NEXT_PUBLIC_SUPABASE_URL` | unset | preview project | production project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | unset | preview key | production key |
| `SUPABASE_SERVICE_ROLE_KEY` | unset | preview secret | production secret |
| `SUPABASE_STORAGE_BUCKET` | unset | `package-labels` | `package-labels` |
| `SEED_*_AUTH_SUBJECT` | optional | synthetic users only | do not seed |

Preview and production must use different Supabase projects. Never expose the service role through a `NEXT_PUBLIC_*` variable or paste secret values into Git, logs, screenshots, or issue comments.

## Local verification

```powershell
npm ci
npm run prisma:validate
npm run prisma:supabase:validate
npm run prisma:generate
npm run test:auth-cloud
npm run validate:cloud-foundation
npm run typecheck
npm run build
```

SQLite remains a UI and manual-flow fallback and uses `npm run prisma:push`. The cloud schema must never use `db push`; the package script intentionally blocks it.

## Preview provisioning

1. Create an isolated Supabase preview project and confirm backup/PITR capability before migration.
2. Disable public Auth signup. Create synthetic ADMIN, MANAGER, and FRONT_DESK users by administrative invitation.
3. Configure only preview environment variables in Vercel Preview.
4. Apply the PostgreSQL migration procedure below from a controlled shell, never from the application build.
5. Link each invited Auth user ID to the intended operator with `Operator.authSubject`. The optional seed variables can do this only on a disposable synthetic database.
6. Confirm the `package-labels` bucket is private in the Supabase dashboard.
7. Record preview URL, Git commit, Supabase project ref, migration names, and QA evidence. Do not record secrets.

## PostgreSQL migrations

For an empty database:

```powershell
npm run prisma:supabase:migrate:deploy
npm run prisma:supabase:migrate:status
```

For an existing database, do not deploy the baseline blindly:

1. Take a backup or confirm a usable PITR point.
2. Compare the real schema with `prisma/migrations/20260621000000_baseline/migration.sql`.
3. Resolve drift before continuing. Do not mark a mismatched baseline as applied.
4. Only after an exact comparison, baseline it:

```powershell
npx prisma migrate resolve --applied 20260621000000_baseline --schema prisma/schema.supabase.prisma
npm run prisma:supabase:migrate:status
npm run prisma:supabase:migrate:deploy
npm run prisma:supabase:migrate:status
```

The CI migrations job executes both migrations against disposable PostgreSQL with compatible Supabase roles and a minimal Storage schema.

## Rollback

- Application-only failure: roll back the Vercel Preview deployment to the preceding commit. Do not change production.
- Migration failure before completion: stop the application rollout, preserve logs without secrets, and restore the preview backup/PITR point if the transaction did not roll back cleanly.
- Auth linkage failure: clear only the incorrect `authSubject` and relink it after checking the Auth user ID. Null linkage denies access.
- Storage failure: keep the bucket private. Do not make it public as a workaround. Fix configuration and retry the upload.
- Prisma has no automatic down migration. Any reverse SQL requires review and a backup. Dropping columns or tables is outside this phase.

## Required smoke tests

Run via HTTPS on desktop, Android Chrome, and iPhone Safari when devices are available:

- anonymous access to protected pages redirects to login and protected APIs return `401`;
- FRONT_DESK completes intake, notify, pending, pickup, and history cannot access admin;
- ADMIN and MANAGER access administrative pages;
- inactive and unlinked operators receive `403`;
- a user from organization A cannot read or mutate organization B records or label paths;
- upload returns an object path, the bucket remains private, and label display uses a short-lived signed URL;
- denied camera access immediately exposes file capture;
- OCR failure preserves the photo and allows manual code/carrier entry;
- upload failure preserves the form for retry and creates no package with a missing photo;
- no phone, OCR content, signed URL, or service role appears in browser/server logs.

Real Supabase Auth, real private Storage, Vercel Preview, backup restore, and physical-phone QA require preview credentials and devices. Não consigo confirmar isso from the repository alone.

## Promotion gate

Do not promote to production until every smoke-test item has dated evidence, `migrate status` is clean against preview, rollback has been rehearsed, and the Sellable MVP checklist is `PASS`.
