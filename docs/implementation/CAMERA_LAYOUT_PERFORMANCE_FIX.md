# Camera, Layout and Performance Fix

## Context

This hotfix prepares the live MVP for a real condominium pilot without changing product scope.

It keeps the project focused on package logistics:
- mobile front desk intake;
- label photo capture or upload;
- resident autocomplete;
- package creation;
- assisted WhatsApp notification;
- pending and admin package control.

No authentication, billing, visitor, reservation or unrelated condominium modules were added.

## Camera intake behavior

The mobile intake remains available at `/mobile/intake`.

The primary action is direct camera capture through `navigator.mediaDevices.getUserMedia`.
The browser prompt is triggered only after the user taps the camera button.

The camera flow now:
- checks secure context before requesting camera access;
- requires HTTPS or localhost for direct camera access;
- prefers the rear camera with `facingMode: { ideal: "environment" }`;
- requests a 4:3-friendly capture size;
- falls back to generic `video: true` when rear-camera constraints fail;
- waits for video metadata before enabling capture;
- stops active camera tracks when a photo is captured, replaced or retried;
- shows readable Portuguese error states for permission, insecure context, missing camera and camera-busy cases.

The fallback remains available through file input:
- `accept="image/jpeg,image/png,image/webp,image/*"`;
- `capture="environment"`;
- usable on mobile browsers that block direct camera preview.

## Secure-context note

Real camera preview on a physical phone requires a secure browser context.

Expected working contexts:
- production Vercel URL over HTTPS;
- localhost during local desktop testing.

Contexts that can fail:
- phone accessing a local dev server over plain HTTP;
- browser without `getUserMedia`;
- camera permission denied by the user or OS;
- camera already in use by another app.

In those cases, the operator can continue with the Anexar fallback.

## Layout and contrast

The affected screens were adjusted for clearer operational hierarchy:
- `/`;
- `/admin`;
- `/admin/packages`;
- `/admin/residents`;
- `/mobile`;
- `/mobile/pending`;
- `/mobile/intake`.

The changes keep UI text in Brazilian Portuguese and use:
- stronger primary/secondary actions;
- explicit dark-on-light or light-on-dark button contrast;
- consistent `rounded-[8px]` cards and controls;
- mobile touch targets of at least 44px where actions are expected;
- reduced visual noise for cockpit-style admin pages.

## Performance changes

The hotfix reduces payload and query cost on DB-backed pages by:
- selecting only fields used by admin and mobile tables;
- limiting large operational lists;
- aggregating building activity from package rows instead of loading every building, unit and nested package relation;
- using a Prisma transaction for dashboard counts;
- adding local and Supabase schema indexes for resident search/status and package pickup filtering.

Indexes added in both Prisma schemas:
- `Resident.name`;
- `Resident.isActive`;
- `Package.pickedUpAt`.

SQLite local development remains supported. Supabase/Postgres preparation remains mirrored in `prisma/schema.supabase.prisma`.

## Cloud and local mode

Local mode remains SQLite-based through the default Prisma schema and `.env` `DATABASE_URL`.

Cloud mode remains prepared through:
- Supabase Postgres schema validation;
- Supabase Storage abstraction already documented for the `package-labels` bucket;
- Vercel deployment guidance in `SUPABASE_VERCEL_SETUP.md`.

This hotfix does not add, remove or expose any secrets. Real Supabase and Vercel validation still requires actual project credentials and deployment environment variables.

## Validation checklist

Required local validation:
- `npm run prisma:validate`;
- `npm run prisma:supabase:validate`;
- `npm run db:push` if schema indexes changed;
- `npm run db:seed` if local SQLite needs refreshed seed data;
- `npm run typecheck`;
- `npm run build`.

Manual pilot validation still required:
- open the deployed HTTPS Vercel URL on a real phone;
- grant camera permission;
- verify live preview uses the rear camera when available;
- capture and retake a label photo;
- complete resident autocomplete, package creation and WhatsApp success flow;
- verify the Anexar fallback still works if direct camera capture is blocked.

