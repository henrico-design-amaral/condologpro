# Implementation Log

Trilha de execução da branch `mvp/offline-first-foundation`.

## 0. Setup

- Branch criada a partir de `infra/supabase-vercel-camera-mvp` (working tree limpa).
- Diretórios `.agents/` e `.skills/` adicionados com 8 agentes e 9 skills.
- Scripts `db:*` registrados em `package.json`.

## 1. Fundação de dados

- `prisma/seed.ts` reescrito com:
  - `planFor()` determinístico distribuindo 32 encomendas em PENDING (9) / NOTIFIED (11) / PICKED_UP (10) / CANCELLED (2).
  - 3 encomendas PENDING com `receivedAt` > 24 h para validar a regra de atraso.
  - Operadores (ADMIN, FRONT_DESK, MANAGER) recriados a cada seed.
- `npm run db:seed` → 5 buildings, 50 units, 120 residents, 32 packages, 65 events.

## 2. Helpers de domínio

- `src/lib/stats.ts`: `OVERDUE_THRESHOLD_HOURS = 24`, `getDashboardStats()`, `getBuildingActivity()`, `isPackageOverdue()`, `formatAverageHours()`.
- `src/lib/format.ts`: `formatDateTime`, `formatDate`, `formatRelativeHours` (pt-BR via `Intl`).
- `src/components/status-badge.tsx`: `StatusBadge` e `statusLabel` para PENDING / NOTIFIED / PICKED_UP / CANCELLED / OVERDUE.

## 3. Painel admin (`/admin`)

- Reescrito com 4 KPIs primários (hoje, ontem, pendentes, avisadas) e 3 secundários (atrasadas, tempo médio de retirada, moradores ativos).
- Cartões de navegação para pacotes, histórico, moradores, importação, configurações.
- Tabela "Pacotes recentes" e "Atividade por bloco" (top 5).

## 4. Pacotes (`/admin/packages`)

- Listagem com busca, filtro de status e filtro de atrasadas (>24h).
- `StatusBadge` aplicado em cada linha.
- `take: 100` para não estourar a tabela.

## 5. Histórico (`/admin/history`)

- Nova rota com filtros: busca textual, bloco, status e intervalo de datas.
- Timeline de eventos por pacote (`PACKAGE_RECEIVED`, `PACKAGE_NOTIFIED`, `PACKAGE_PICKED_UP`, `PACKAGE_UPDATED`, `PACKAGE_CANCELLED`).

## 6. Importação (`/admin/import` + `/api/import/residents`)

- `src/lib/import-csv.ts`: `parseCsv` valida cabeçalhos, normaliza booleanos, monta `ImportPreview`.
- Endpoint aceita `mode: "preview" | "commit"`, valida com Zod, cria buildings/units/residents sob demanda, conta duplicatas em `skipped`.
- `ImportForm` (client component) oferece 3 caminhos: simulação (textarea), upload de arquivo e download do template.

## 7. Configurações (`/admin/settings`)

- Server action `updateOrganization` persiste nome, endereço e WhatsApp institucional.
- Cards com totais (pacotes, atrasadas, retiradas hoje, operadores) e bloco de regras.

## 8. Mobile — Portaria (`/mobile`)

- Home repaginada com:
  - Botão grande "Nova encomenda" com ícone de câmera.
  - Resumo do turno (pendentes / entradas hoje / retiradas).
  - Banner de atrasadas quando > 0 (linka para `?overdue=1`).
  - Atalhos para pendentes, histórico e admin.
- `lang` e `aria-label` revisados; foco visível em todos os controles.

## 9. Mobile — Pendentes (`/mobile/pending`)

- Busca, radios de status (Todas / Pendentes / Avisadas) e checkbox "Atrasadas (24h+)".
- Card destacado em rosa para atrasadas, com `StatusBadge OVERDUE`.

## 10. Mobile — Detalhe da encomenda (`/mobile/package/[id]`)

- Layout em seções: header com morador/unidade, foto da etiqueta (ou placeholder), dados, bloco de notificação, formulário de retirada condicional, timeline.
- Server actions: `markNotified` e `confirmPickup` (ambos com revalidação de path).
- Foto com `alt` descritivo e fallback acessível.

## 11. Mobile — Intake (`/mobile/intake`)

- Mantido como `IntakeForm` client component (câmera, OCR opcional, autocomplete de morador, envio).
- Sem mudanças estruturais: já cobria a régua de UI e acessibilidade.

## 12. Validações executadas

- `npm run prisma:validate` → OK
- `npm run typecheck` → OK (corrigido cast de `PackageStatus` e null-check em import route)
- `npm run db:push` → OK
- `npm run db:seed` → 5 buildings, 50 units, 120 residents, 32 packages, 65 events
- `npm run build` → 16/16 páginas estáticas geradas, 0 erros

## 13. Documentação

- `docs/MVP_SCOPE.md` — visão, personas, fora de escopo, critérios de aceite.
- `docs/OFFLINE_FIRST_ARCHITECTURE.md` — camadas, modelo de dados, fluxos críticos.
- `docs/BENCHMARK_NOTES.md` — comparativo com mercado e decisões de UI derivadas.
- `docs/VALIDATION_PLAN.md` — comandos e checklists manuais.
- `docs/PRODUCT_DECISIONS.md` — 10 decisões datadas (D1 a D10) com contexto e consequência.
- `docs/IMPLEMENTATION_LOG.md` — este arquivo.

## 14. Pendências (próxima iteração, fora deste commit)

- PWA manifest + service worker para tolerar offline real.
- Integração com WhatsApp Cloud API (opt-in) para registrar envios.
- XLSX parser além de CSV.
- Multi-condomínio simultâneo (já suportado pelo schema, falta UI).
- Exportação CSV/PDF de pacotes por período.
