# PROJECT CONTROL — CondoLogOPS Marketing

## Estado atual

Fase: **Marketing Stable / Operational Release Validation**.

Este repositório é exclusivamente a superfície Astro pública do CondoLogOPS.

| Superfície | Autoridade | Runtime |
| --- | --- | --- |
| Marketing | `henrico-design-amaral/condologpro` | Astro estático |
| Operacional | `henrico-design-amaral/condologpro-app` | Next.js + TypeScript |

## Estado verificado em 2026-09-21

- identidade semântica pública consolidada como **CondoLogOPS**;
- `VISUAL_LOCK.json` promovido a `READY` a partir dos tokens da implementação aceita;
- CI e Pages do marketing verdes no lote de identidade;
- runtime Next.js/Prisma dormente removido da árvore ativa em lote isolado;
- domínio técnico permanece `condologpro.henrico.works`;
- produção do app operacional continua separada e não deve ser inferida pelo estado da landing.

## Infraestrutura operacional

O Supabase legado `ricnsldmlnisleklmmch` foi restaurado em 2026-09-21 e voltou a `ACTIVE_HEALTHY`, porém o schema remoto é incompatível com o ledger Prisma atual do app. Ele permanece preservado e não é target autorizado de E2E do runtime recuperado.

## Regras

- não reintroduzir runtime operacional neste repositório;
- não adicionar Prisma, auth ou migrations ao marketing;
- não usar `CondoLogPro` como marca semântica pública;
- não alegar `PILOT_READY` ou `PRODUCTION_READY` do app com base no marketing;
- qualquer nova alteração visual deve respeitar `VISUAL_LOCK.json`.
