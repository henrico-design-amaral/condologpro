# Mapeamento do legado para Supabase

## Dados encontrados

O SQLite ignorado pelo Git contém somente seed demonstrativa. Ele permanece recuperável no histórico local e será suportado por um importador, mas não será enviado ao Supabase automaticamente.

## Entidades

| Legado Prisma | Supabase | Decisão |
| --- | --- | --- |
| `Organization` | `condominiums` | UUID e configuração de retenção/WhatsApp. |
| `Building` | `blocks` | `label` e unicidade por condomínio. |
| `Unit` | `units` | Unidade ativa, bloco e número. |
| `Resident.unitId` | `residents` + `resident_units` | Permite mais de uma unidade, ex-morador e vínculo principal. |
| `Operator` | `profiles` + `user_condominiums` + `roles` + `user_roles` | Identidade vem do Supabase Auth. |
| `Package` | `packages` + tabelas de evidência | Foto, OCR, aviso e retirada deixam de ser colunas comprimidas. |
| `PackageEvent` | `package_status_history` + `audit_events` | Histórico de domínio separado de auditoria técnica. |

## Status

| Legado | Novo |
| --- | --- |
| `PENDING` sem aviso | `awaiting_notification` |
| `NOTIFIED` | `awaiting_pickup` |
| `PICKED_UP` | `picked_up` |
| `CANCELLED` | `cancelled` |

Novos estados sem equivalente direto: `awaiting_identification`, `returned` e `problem`.

## Arquivos

- `labelPhotoUrl` local será interpretado como fonte legada.
- O importador envia o arquivo para `package-evidence/<condominium>/<package>/` e grava somente o path do objeto.
- Base64 nunca entra no Postgres.

## Remoções após paridade

- `src/app`, `src/components` e bibliotecas Next/Prisma.
- `prisma`, `next.config.ts`, `next-env.d.ts`, `postcss.config.mjs` e `vercel.json`.
- scripts e documentação que tratam SQLite/Vercel como runtime atual.

Documentos históricos permanecem apenas quando marcados como legado; README, controle, decisões e handoff serão atualizados para descrever o estado real.
