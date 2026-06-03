# TASKS — CondoLogPro

## Fundação

- [x] Criar pasta raiz do projeto.
- [x] Criar arquivos de controle.
- [x] Inicializar Git local.
- [x] Criar PDR completo.
- [x] Criar prompts Claude Code.
- [x] Criar agentes Claude (`.claude/agents/*` e `.agents/*`).
- [x] Criar skills Claude (`.claude/skills/*` e `.skills/*`).
- [x] Criar documentação de arquitetura local-first.
- [x] Criar plano de implementação do MVP.
- [x] Criar checklist QA piloto.
- [x] Criar documentação de setup Supabase/Vercel.
- [x] Criar documentação cloud-ready foundation.

## Bootstrap técnico

- [x] Criar estrutura inicial Next.js.
- [x] Instalar dependências.
- [x] Configurar Prisma + SQLite (local).
- [x] Criar schema local (`prisma/schema.prisma`).
- [x] Criar schema Supabase (`prisma/schema.supabase.prisma`).
- [x] Criar seed data determinístico (5 buildings, 50 units, 120 residents, 32 packages).
- [x] Criar fluxo mobile de recebimento.
- [x] Criar fluxo desktop admin.
- [x] Criar WhatsApp assistido.
- [x] Criar retirada digital.
- [x] Criar importador CSV (preview + commit).
- [x] Criar dashboard com KPIs.
- [x] Criar página de histórico com timeline de eventos.
- [x] Preparar CI para criar/semear SQLite antes do build.
- [ ] Rodar QA operacional manual completo.
- [ ] Testar acesso mobile na rede local.

## Cloud-ready MVP

- [x] Criar branch `infra/supabase-vercel-camera-mvp`.
- [x] Adicionar variáveis Supabase em `.env.example`.
- [x] Criar `prisma/schema.supabase.prisma` para PostgreSQL.
- [x] Criar scripts `prisma:supabase:*` (`validate`, `generate`, `push`, `seed`, `studio`).
- [x] Criar scripts locais `db:*` equivalentes para CI/desenvolvimento.
- [x] Criar `src/lib/storage.ts` com fallback local e Supabase Storage.
- [x] Adicionar `createSignedLabelUrl()` para bucket privado.
- [x] Adicionar `detectStorageMode()` para inspeção operacional.
- [x] Criar `vercel.json` (framework, build, headers de segurança).
- [x] Criar `.github/workflows/ci.yml`.
- [x] Atualizar CI com `prisma:push` e `prisma:seed` antes de `typecheck`/`build`.
- [x] Criar `docs/implementation/CLOUD_READY_FOUNDATION.md`.
- [x] Criar `docs/implementation/SUPABASE_VERCEL_SETUP.md`.
- [x] Criar `docs/implementation/CAMERA_CAPTURE_CORE_FLOW.md`.
- [x] Atualizar `docs/MVP_SCOPE.md` para cloud-ready.
- [x] Atualizar `docs/OFFLINE_FIRST_ARCHITECTURE.md` para fallback local.
- [x] Atualizar `PROJECT_CONTROL.md`, `TASKS.md`, `HANDOFF.md`.
- [ ] Criar projeto Supabase real.
- [ ] Criar bucket Supabase real (`package-labels`).
- [ ] Configurar variáveis reais na Vercel (Production/Preview).
- [ ] Conectar GitHub à Vercel.
- [ ] Validar conexão cloud real (push, seed, upload, signed URL).
- [ ] Adicionar endpoint `/api/upload/label/[...path]` se bucket for privado.

## MVP Core

- [x] Cadastro de condomínio demo.
- [x] Cadastro de blocos.
- [x] Cadastro de apartamentos.
- [x] Cadastro de moradores.
- [x] Importação CSV (preview + commit).
- [ ] Importação XLSX (deferida).
- [x] Registro de encomenda.
- [x] Upload/foto da etiqueta (local + Supabase).
- [x] Associação com morador por autocomplete.
- [x] Mensagem WhatsApp pronta (`wa.me`).
- [x] Lista de encomendas pendentes.
- [x] Baixa de retirada.
- [x] Histórico de eventos.
- [x] OCR experimental não bloqueante.
- [x] Câmera direta com `getUserMedia`, preview, captura e retake.
- [x] Fallback com `<input type="file" accept="image/*" capture="environment">`.
- [x] Estados de erro para permissão, contexto inseguro e navegador sem suporte.
- [x] Atrasadas (>24h) destacadas em listas.
- [x] Status badges semânticos.
- [x] Dashboard com KPIs primários e secundários.

## Fora de escopo no MVP

- [ ] Cobrança.
- [ ] Multi-condomínio em produção.
- [ ] WhatsApp Cloud API.
- [ ] OCR avançado obrigatório (nuvem).
- [ ] Módulo de manutenção.
- [ ] Módulo de comunicados.
- [ ] PWA manifest / service worker (próxima iteração).
- [ ] Migrations versionadas (próxima iteração, quando estrutura estabilizar).
