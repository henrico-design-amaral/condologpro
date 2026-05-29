# CLAUDE.md — CondoLogPro

Read this file before making changes.

## Product

CondoLogPro is a local-first operational SaaS MVP for condominium package management.

The first test version must support a real condominium workflow:

- mobile package intake at the front desk;
- label photo capture;
- resident/unit matching;
- package entry creation;
- assisted WhatsApp notification;
- package pickup confirmation;
- desktop admin dashboard.

## Operating rules

1. Do not create generic condominium software.
2. Focus on package logistics first.
3. Do not implement unnecessary modules before the core package workflow works.
4. Preserve local-first behavior for MVP.
5. Use simple, robust architecture.
6. Prefer working flows over decorative UI.
7. UI text must be in Brazilian Portuguese.
8. Source code must use English names for variables, functions, files and components.
9. Avoid hidden magic. Every important operational action must be visible and auditable.
10. Keep mobile intake extremely fast.

## Technical direction

Preferred stack:

- Next.js App Router
- TypeScript
- Prisma
- SQLite for MVP
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Local uploads
- WhatsApp assisted sending via generated link

## Core MVP flow

1. Admin imports or registers condominium units and residents.
2. Front desk opens mobile intake screen.
3. Operator photographs package label.
4. Operator selects or confirms building/unit/resident.
5. System creates a package record.
6. System generates WhatsApp notification.
7. Resident comes to pick up package.
8. Operator confirms pickup.
9. System stores full audit history.

## Do not do yet

- Do not build payment/billing.
- Do not build full multi-tenant SaaS production infrastructure.
- Do not build maintenance, reservations, complaints or general messaging modules yet.
- Do not depend on WhatsApp Cloud API for MVP.
- Do not require external OCR API for the first version.

## Definition of done for MVP

The MVP is acceptable only if a real front desk operator can:

- register a package from mobile;
- attach/fotograph a label;
- find the resident quickly;
- notify through WhatsApp;
- see pending packages;
- mark a package as picked up;
- admin can review all records from desktop.
