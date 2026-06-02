# Product Decisions

Registro datado das decisões que moldaram o MVP. Cada entrada tem **contexto → decisão → consequência**.

## 2026-06 — Foundation MVP (branch `mvp/offline-first-foundation`)

### D1. Manter `PackageStatus` enum (PENDING / NOTIFIED / PICKED_UP / CANCELLED)
- **Contexto**: a sugestão inicial era trocar para `RECEIVED / PENDING_PICKUP / RETURNED`.
- **Decisão**: manter o enum existente. `PENDING` continua significando "aguardando retirada pelo morador"; o ato de "receber" é coberto pelo `PackageEvent` `PACKAGE_RECEIVED`.
- **Consequência**: zero migração de dados; UI usa `isPackageOverdue` para destacar visualmente; nenhum enum paralelo.

### D2. `OVERDUE` como estado derivado, não persistido
- **Contexto**: atrasos precisam ser visíveis, mas regra de "24h" pode mudar com o tempo.
- **Decisão**: `OVERDUE_THRESHOLD_HOURS = 24` em `src/lib/stats.ts`; função `isPackageOverdue(pkg)` padroniza o cálculo. Nada é gravado no banco.
- **Consequência**: mudar a janela é uma constante; sem risco de drift entre colunas e regras.

### D3. Sem `PackagePhoto`, `NotificationLog`, `PickupConfirmation` no MVP
- **Contexto**: discussão se deveria criar tabelas dedicadas para foto, log de WhatsApp e auditoria de retirada.
- **Decisão**: usar `Package.labelPhotoUrl` (foto) + `PackageEvent` (auditoria) + `Package.pickedUp{At,ByName,ByDocument}` (retirada).
- **Consequência**: 1 tabela a menos para migrar, 1 fonte de verdade para timeline, modelo mais simples de explicar.

### D4. WhatsApp via `wa.me`, não Cloud API
- **Contexto**: o porteiro precisa avisar o morador.
- **Decisão**: `src/lib/whatsapp.ts` monta a URL `https://wa.me/<phone>?text=<msg>` e o porteiro toca em "Abrir WhatsApp" no app. Sem webhook, sem segredo, sem custo.
- **Consequência**: funciona offline; não há registro automático do envio. A baixa manual via "Marcar como avisado" cobre a auditoria.

### D5. CSV real para importação (XLSX deferido)
- **Contexto**: síndicos geralmente exportam a base do antigo sistema em Excel/CSV.
- **Decisão**: endpoint `/api/import/residents` aceita `preview` ou `commit` via Zod. Template CSV embutido em `src/lib/import-csv.ts`.
- **Consequência**: parsing transparente, validação linha-a-linha, rollback trivial (apaga via Prisma). XLSX fica para iteração posterior.

### D6. UI dual: portaria dark + admin light
- **Contexto**: dois públicos com contextos de uso opostos.
- **Decisão**: rotas `/mobile/*` em **dark** com alvos grandes; `/admin/*` em **light** denso, tabela-first.
- **Consequência**: reduz troca de contexto entre turnos; o porteiro não erra toque à noite, o síndico lê muitas linhas de dia.

### D7. Storage local (`public/uploads`) no MVP, Supabase Storage preparado
- **Contexto**: latência e custo de upload na portaria são pontos sensíveis.
- **Decisão**: `src/lib/storage.ts` já abstrai a escrita. MVP usa o caminho local; Supabase Storage é opt-in via env.
- **Consequência**: zero configuração para piloto; migração posterior é trocar a função `saveUpload` e nada mais.

### D8. Sem `service worker` / PWA manifest no MVP
- **Contexto**: offline-first implica PWA na cabeça do usuário.
- **Decisão**: a UX é desenhada para tolerar offline (cria encomenda, baixa retirada), mas o MVP não instala `service worker` para evitar esconder bugs de cache.
- **Consequência**: offline significa "rede instável, app resiliente" e não "instalado como app". PWA entra na próxima iteração, com cache de assets críticos.

### D9. Idioma
- **Contexto**: condomínios no Brasil; UI precisa falar português.
- **Decisão**: UI e mensagens em **pt-BR**; código, enums e endpoints em **inglês**; documentação bilíngue.
- **Consequência**: revisão de copy fica centralizada nos componentes de UI; tipos e APIs continuam universais.

### D10. Scripts de banco em `package.json`
- **Contexto**: parâmetros longos do Prisma 7 atrapalham onboarding.
- **Decisão**: aliases `db:validate`, `db:generate`, `db:push`, `db:seed`, `db:reset`.
- **Consequência**: `npm run db:seed` em vez de lembrar `prisma db seed`; o warning de `prisma.config` no console fica documentado.
