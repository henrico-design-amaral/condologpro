# Visual-First MVP Flow

**Branch:** feat/visual-first-mvp-flow  
**Date:** 2026-05-29  
**Status:** Implemented

## What was built

Complete end-to-end package workflow covering the full portaria operator loop
and the admin desktop view. All UI text is Brazilian Portuguese. All source
identifiers are English.

## Routes implemented

| Route | Type | Description |
|---|---|---|
| `/mobile` | Server | Home portaria com contadores em tempo real |
| `/mobile/intake` | Server + Client | Formulário de entrada de encomenda |
| `/mobile/pending` | Server | Lista de pendentes/avisados |
| `/mobile/package/[id]` | Server + Client | Detalhe, WhatsApp assistido, retirada |
| `/admin` | Server | Dashboard operacional com métricas |
| `/admin/packages` | Server | Tabela completa de encomendas |
| `/admin/residents` | Server | Tabela de moradores |
| `/admin/import` | Server | Tela planejada de importação CSV |
| `/admin/settings` | Server | Dados do condomínio e modo local-first |

## API routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/upload` | POST | Upload de foto de etiqueta (jpg/png/webp, máx 5 MB) |
| `/api/packages` | POST | Criação de encomenda |
| `/api/packages/[id]/notify` | POST | Marca encomenda como avisada |
| `/api/packages/[id]/pickup` | POST | Confirma retirada |

## Data layer

All data functions in `src/lib/data.ts`:

- `getDefaultOrg` — fetches the single demo organization
- `getDashboardSummary` — counts for today/pending/notified/pickedUpToday
- `getRecentPackages` — last N packages with unit + resident
- `getResidentsForSelect` — active residents grouped for the intake selector
- `getPendingPackages` — PENDING + NOTIFIED packages
- `getAllPackages` — full package list for admin
- `getAllResidents` — full resident list for admin
- `getPackageById` — single package with events + org
- `createPackage` — creates package + PACKAGE_RECEIVED event
- `markPackageAsNotified` — sets NOTIFIED status + event
- `markPackageAsPickedUp` — sets PICKED_UP status + event

## Shared components

- `StatusBadge` / `StatusBadgeDark` — colored pill for package status
- `MetricCard` / `MetricCardDark` — metric tile for dashboards
- `EmptyState` — empty state for tables and lists

## Uploads

Files saved to `public/uploads/labels/` with timestamped random filenames.
Directory is gitignored via `public/uploads/*` with a `.gitkeep`. 
Accepted types: jpg, png, webp. Max size: 5 MB.

## WhatsApp flow

Assisted — no Cloud API. `buildWhatsAppUrl` + `buildPackageNotificationMessage`
in `src/lib/whatsapp.ts` produce a `wa.me` deep link. Operator reviews the
pre-filled message and taps send. After sending, operator taps
"Marcar como avisado" to record the notification event.

## Visual direction

- Mobile portaria: `bg-neutral-950` dark, high contrast, large touch targets,
  tactile active states.
- Admin desktop: `bg-neutral-50` enterprise light, card-based, sticky top nav,
  data tables with `bg-neutral-50` headers.

## Known limitations

- No auth — single-org, single-operator mode.
- No real OCR — label photo is stored but not parsed.
- CSV import UI is a planned screen only; full import logic is next phase.
- No search/filter on pending list or admin tables (next iteration).
- WhatsApp delivery is unverifiable — operator must confirm manually.
