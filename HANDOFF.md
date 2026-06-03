# HANDOFF — CondoLogPro

## Último estado conhecido

Branch atual: `infra/supabase-vercel-camera-mvp`.

Esta branch está resolvendo o merge de `main` após PR #6. O estado final deve preservar:

- PR #6: CI prepara SQLite antes de `typecheck`/`build`, roda `prisma:push` e `prisma:seed`, páginas DB-backed são `force-dynamic`, docs cloud-ready atualizados.
- Branch atual: câmera-first mobile intake, Supabase/Vercel setup, storage abstraction, OCR opcional, autocomplete, criação de pacote e WhatsApp success flow.

O projeto está **cloud-ready com fallback local**:

- App Next.js funcional com base local-first sólida.
- Prisma com **dois schemas** (SQLite local e PostgreSQL para Supabase).
- `src/lib/storage.ts` decide entre `public/uploads` e Supabase Storage; suporta bucket público e privado (signed URL server-side).
- Seed determinístico: condomínio demo, 5 blocos, 50 unidades, 120 moradores, 32 encomendas (9 PENDING / 11 NOTIFIED / 10 PICKED_UP / 2 CANCELLED, 3 atrasadas >24h), 65 eventos, 3 operadores.
- Telefone seedado como `+55 11 953970704`.
- Fluxo `/mobile/intake` com câmera direta, captura por arquivo, OCR experimental e autocomplete de moradores.
- Upload de etiqueta local ou Supabase Storage conforme variáveis de ambiente.
- `/mobile/pending` com busca, filtros e destaque para atrasadas.
- `/mobile/package/[id]` com baixa de retirada, notificação via WhatsApp assistido e timeline.
- `/admin` com KPIs, `/admin/packages`, `/admin/history`, `/admin/residents`, `/admin/import`, `/admin/settings`.
- Importador CSV com `preview` e `commit` (Zod).
- CI no GitHub Actions rodando **`prisma:validate` → `prisma:generate` → inicialização do SQLite → `prisma:push` → `prisma:seed` → `typecheck` → `build`**.
- Páginas DB-backed marcadas como `force-dynamic` para refletir dados em tempo real e desacoplar o build do estado da seed.
- `vercel.json` no root para deploy.
- Documentação completa em `docs/MVP_SCOPE.md`, `docs/OFFLINE_FIRST_ARCHITECTURE.md`, `docs/PRODUCT_DECISIONS.md`, `docs/VALIDATION_PLAN.md`, `docs/BENCHMARK_NOTES.md`, `docs/IMPLEMENTATION_LOG.md`, `docs/implementation/CLOUD_READY_FOUNDATION.md`, `docs/implementation/SUPABASE_VERCEL_SETUP.md`, `docs/implementation/CAMERA_CAPTURE_CORE_FLOW.md`.

## Contexto essencial

CondoLogPro é um **MVP de logística de encomendas condominiais**, não um app genérico de condomínio. A direção estratégica atual é **cloud-ready com fallback local** — Vercel + Supabase Postgres + Supabase Storage são o alvo; SQLite + `public/uploads` continuam sendo o modo de desenvolvimento e contingência.

O fluxo real de referência continua:

1. Portaria/administração recebe encomenda.
2. Operador fotografa etiqueta.
3. Operador confirma morador/unidade (autocomplete).
4. Sistema registra encomenda.
5. Sistema gera WhatsApp assistido (`wa.me`).
6. Encomenda aparece em pendentes.
7. Operador baixa retirada.
8. Admin consulta registros, histórico e KPIs.

## O que depende do usuário

- Criar ou confirmar repositório GitHub remoto.
- Criar projeto Supabase.
- Criar bucket `package-labels` (público ou privado).
- Configurar variáveis reais no Supabase/Vercel.
- Conectar repo GitHub à Vercel.
- Rodar comandos cloud documentados em `docs/implementation/SUPABASE_VERCEL_SETUP.md`.
- Se o bucket for privado, decidir se a UI consome signed URL via endpoint dedicado (follow-up).
- Testar câmera em aparelho físico via HTTPS. Em celular pela LAN HTTP, `getUserMedia` pode falhar e o fallback de upload/captura deve ser usado.

## Atenção

- **Não há credenciais Supabase reais neste ambiente.**
- **Não afirmar validação cloud antes de testar com `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SERVICE_ROLE_KEY` e bucket reais.**
- **Manter fallback local e manual.**
- **Não expor a service role key ao cliente.** Toda chamada Supabase Storage e signed URL fica server-side (`src/lib/storage.ts`, `/api/*`).
- **Não adicionar billing, WhatsApp Cloud API ou módulos genéricos antes do fluxo de encomendas estar validado em cloud.**
