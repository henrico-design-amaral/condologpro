# COMMAND PROMPTS — CondoLogPro

## 1. Session start

Read CLAUDE.md first.

Use:
- product-architect
- local-first-mvp-guard
- session-start skill

Task:
Start a new work session for CondoLogPro.

Before doing anything:
1. Run git status -sb.
2. Run git branch --show-current.
3. Read PROJECT_CONTROL.md.
4. Read TASKS.md.
5. Read DECISIONS.md.
6. Read docs/product/PDR_CONDOLOGPRO_LOCAL_FIRST_MVP.md.
7. Do not edit files.

Report:
- current branch;
- working tree status;
- project phase;
- risks;
- recommended next action.

## 2. Bootstrap technical app

Read CLAUDE.md first.
Read docs/product/PDR_CONDOLOGPRO_LOCAL_FIRST_MVP.md.
Read docs/architecture/LOCAL_FIRST_ARCHITECTURE.md.
Read docs/implementation/MVP_IMPLEMENTATION_PLAN.md.

Use:
- fullstack-implementer
- local-first-mvp-guard

Task:
Bootstrap the technical app for CondoLogPro inside the current repository.

Requirements:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- SQLite
- Zod
- React Hook Form
- local upload folder

Do not implement product features yet.

Before editing:
1. Run git status -sb.
2. Confirm branch.
3. Stop if working tree is dirty.

Deliver:
- working Next.js app;
- base layout;
- app routes placeholders;
- Prisma initialized;
- npm scripts working.

Validation:
- npm run dev
- npm run lint if available
- npx prisma validate

## 3. Database and seed

Read CLAUDE.md first.
Read docs/product/PDR_CONDOLOGPRO_LOCAL_FIRST_MVP.md.

Use:
- fullstack-implementer

Task:
Create the initial Prisma schema and seed data for CondoLogPro.

Entities:
- Organization
- Building
- Unit
- Resident
- Package
- PackageEvent
- Operator

Requirements:
- SQLite provider.
- Useful relations.
- Status enums.
- Seed with realistic condominium data.
- UI labels remain Brazilian Portuguese later, but code names in English.

Validation:
- npx prisma validate
- npx prisma db push
- npx prisma db seed

## 4. Admin desktop MVP

Read CLAUDE.md first.
Read PDR.

Use:
- admin-dashboard-specialist
- fullstack-implementer

Task:
Build the desktop admin MVP.

Routes:
- /admin
- /admin/residents
- /admin/packages
- /admin/import
- /admin/settings

Requirements:
- dashboard cards;
- residents table;
- packages table;
- search/filter;
- create/edit resident;
- package detail access;
- responsive desktop layout.

Do not overdesign.
Do not implement modules outside packages/residents.

## 5. Mobile front desk MVP

Read CLAUDE.md first.
Read PDR.

Use:
- mobile-ux-specialist
- fullstack-implementer

Task:
Build the mobile front desk workflow.

Routes:
- /mobile
- /mobile/intake
- /mobile/pending
- /mobile/package/[id]

Requirements:
- large touch targets;
- minimal typing;
- photo upload for label;
- building/unit/resident selection;
- create package;
- show WhatsApp assisted action;
- pending package list;
- pickup confirmation.

Critical:
The flow must be usable on a real phone by a non-technical front desk operator.

## 6. WhatsApp assisted notification

Read CLAUDE.md first.

Use:
- fullstack-implementer
- mobile-ux-specialist

Task:
Implement assisted WhatsApp notification.

Create:
- phone normalization helper;
- message builder;
- wa.me URL builder;
- notify package endpoint;
- button in mobile package success/detail screen.

Message content:
- resident name;
- condominium name;
- building;
- unit;
- date/time;
- pickup instruction.

Do not implement WhatsApp Cloud API.
Do not use unofficial automation.

## 7. Pickup flow

Read CLAUDE.md first.

Use:
- fullstack-implementer
- mobile-ux-specialist

Task:
Implement package pickup flow.

Requirements:
- package detail screen;
- pickup form;
- picked up by name;
- optional document;
- optional note;
- status update;
- PackageEvent created;
- timestamp shown in admin.

## 8. Operational QA

Read CLAUDE.md first.
Read docs/qa/PILOT_QA_CHECKLIST.md.

Use:
- qa-reviewer

Task:
Run a QA review of the MVP.

Do not add new features.

Check:
- app runs;
- database works;
- seed works;
- mobile intake works;
- upload works;
- WhatsApp assisted link works;
- pending list works;
- pickup works;
- admin sees records;
- no unrelated modules were created.

Report:
- pass/fail by checklist;
- bugs;
- recommended fixes;
- whether ready for pilot.

## 9. PR closeout

Read CLAUDE.md first.

Task:
Close the current implementation step.

Before committing:
1. Run git status -sb.
2. Run relevant validations.
3. Review changed files.
4. Update TASKS.md.
5. Update PROJECT_CONTROL.md.
6. Update HANDOFF.md.
7. Commit with clear message.

Do not push unless explicitly instructed.
