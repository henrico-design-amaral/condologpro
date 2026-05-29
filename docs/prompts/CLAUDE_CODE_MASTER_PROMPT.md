# Claude Code Master Prompt — CondoLogPro

Read CLAUDE.md first.
Read PROJECT_CONTROL.md.
Read docs/product/PDR_CONDOLOGPRO_LOCAL_FIRST_MVP.md.
Read docs/architecture/LOCAL_FIRST_ARCHITECTURE.md.
Read docs/implementation/MVP_IMPLEMENTATION_PLAN.md.
Read QUALITY_GATES.md.
Read TASKS.md.
Read DECISIONS.md.

You are implementing CondoLogPro, a local-first MVP for condominium package management.

The goal is not to build a generic condominium platform.

The goal is to build the first functional MVP for a real front desk workflow:

1. Front desk receives a package.
2. Operator photographs the label.
3. Operator links package to building/unit/resident.
4. System creates package record.
5. System generates assisted WhatsApp notification.
6. Package appears in pending list.
7. Operator confirms pickup.
8. Admin reviews records from desktop.

Hard constraints:

- Use Next.js App Router.
- Use TypeScript.
- Use Prisma.
- Use SQLite for MVP.
- Use Tailwind CSS and shadcn/ui.
- UI must be in Brazilian Portuguese.
- Source code names must be in English.
- Do not implement billing.
- Do not implement full SaaS multi-tenancy.
- Do not implement WhatsApp Cloud API.
- Do not make OCR mandatory.
- Do not build maintenance, reservations or general messaging modules.

Implementation order:

1. Verify git state.
2. Bootstrap Next.js project inside current repository.
3. Install required dependencies.
4. Configure Prisma + SQLite.
5. Create schema.
6. Create seed.
7. Create base layouts.
8. Build admin dashboard.
9. Build residents CRUD.
10. Build package CRUD.
11. Build upload route.
12. Build mobile package intake.
13. Build WhatsApp assisted message.
14. Build pending list.
15. Build pickup flow.
16. Run QA checklist.

Before editing:

- run git status -sb;
- confirm current branch;
- report plan;
- avoid unrelated changes.

Definition of done:

- npm run dev works;
- app opens locally;
- /mobile works on responsive viewport;
- /admin works on desktop;
- seed creates useful test data;
- package intake works;
- WhatsApp assisted link works;
- pickup flow works;
- admin can review records;
- no external service required for core flow.
