# Phase 1 — matriz de proveniência

## Legenda

- `keep`: permanece em sua autoridade atual.
- `reimplement`: recuperar seletivamente no app, com teste e adaptação.
- `discard`: não integrar ao destino; preservar apenas como histórico.

## Anchors

| Ref | SHA | Papel |
| --- | --- | --- |
| `origin/main` | `9ec8071` | landing Astro autoritativa |
| `feature/phase-2-auth-cloud-foundation` | `a136054` | anchor Next.js operacional |
| PR #17 / `codex/rebuild-astro-supabase` | `4f131eb` | fonte seletiva e híbrido preservado |
| preservação local | `fe328a8` | snapshot dos 31 arquivos sujos/não rastreados |

## Matriz por capacidade

| Capacidade | Fonte preferida | SHA de origem | Stack de origem | Validação conhecida | Decisão | Destino |
| --- | --- | --- | --- | --- | --- | --- |
| Landing, SEO, narrativa e CTA | `origin/main` | `9ec8071` | Astro estático | publicação histórica; gate atual deve ser refeito | keep | `condologpro` |
| Modelo Package/Resident/Unit/Organization/Event | anchor Next + PR #17 | `a136054`, `0855b72` | Prisma + SQL | CI histórica no anchor; contratos no PR #17 | reimplement | `condologpro-app` |
| Login Supabase Auth e cookies server-side | anchor Next | `2024a69` | Next.js + Supabase Auth | testes auth/cloud e CI históricos | keep/revalidate | `condologpro-app` |
| Autorização por papel e operador ativo | anchor Next | `2024a69` | Next.js server-side | testes históricos; requer smoke atual | keep/revalidate | `condologpro-app` |
| Escopo por organização na aplicação | anchor Next + PR #17 | `2024a69`, `0855b72` | Prisma + repository/SQL | contratos e testes parciais | reimplement | `condologpro-app` |
| RLS, grants e isolamento de tenant | PR #17 | `0855b72`, `9d45d8a` | PostgreSQL/Supabase | security-contract PGlite | reimplement no ledger Prisma | `condologpro-app` |
| Ledger de migrations | anchor Next | `2024a69` | Prisma Migrate | migrate/status históricos | keep como autoridade | `condologpro-app` |
| SQL/RLS adicional do PR #17 | PR #17 | `0855b72` | Supabase SQL | testes de execução no PR | reimplement; não copiar ledger paralelo | `condologpro-app` |
| Storage privado, assinatura e MIME real | anchor Next | `2024a69`, `dc27b58` | Next.js server + Supabase Storage | testes de política históricos | keep/revalidate | `condologpro-app` |
| Edge Function de convite administrativo | PR #17 | `0855b72` | Supabase Edge Function | função remota v2 visível; corpo não revalidado | reimplement após contrato | `condologpro-app` |
| CRUD de operadores | anchor Next | `2024a69` | Next.js Route Handlers | testes auth históricos | keep/revalidate | `condologpro-app` |
| Intake mobile e busca de morador | anchor Next | `a136054` | Next.js App Router | build/CI históricos | keep/revalidate | `condologpro-app` |
| Captura de câmera e fallback de arquivo | anchor Next + PR #17 | `dc27b58`, `cc24308` | React/Next e Preact/Astro | testes locais históricos; aparelho não confirmado | reimplement padrões úteis | `condologpro-app` |
| OCR opcional e confirmação humana | PR #17 | `cc24308`, `9d45d8a` | OCR client-side | testes unitários | reimplement | `condologpro-app` |
| Draft e preservação de formulário | PR #17 | `cc24308`, `9d45d8a` | client storage/state | testes unitários | reimplement | `condologpro-app` |
| Fallback de rede, retry e concorrência | PR #17 | `cc24308`, `9d45d8a` | repository/client contracts | testes unitários/E2E | reimplement | `condologpro-app` |
| Idempotência `clientRequestId` | anchor Next + PR #17 | `2024a69`, `0855b72` | Prisma/PostgreSQL | constraint/testes históricos | keep e endurecer | `condologpro-app` |
| Importação CSV preview/commit | anchor Next | `a136054` | Next.js + Zod | CI histórica | keep/revalidate | `condologpro-app` |
| WhatsApp assistido | anchor Next + PR #17 | `a136054`, `9d45d8a` | `wa.me` | teste unitário no PR | keep e incorporar testes | `condologpro-app` |
| Pendentes, aviso, retirada e histórico | anchor Next | `a136054` | Next.js + Prisma | CI histórica | keep/revalidate | `condologpro-app` |
| Dashboard e métricas operacionais | anchor Next | `a136054` | Next.js + Prisma | CI histórica | keep/revalidate | `condologpro-app` |
| Testes de migration/seed/RLS com PGlite | PR #17 | `9d45d8a` | Vitest + PGlite | suite registrada no PR | reimplement | `condologpro-app` |
| E2E shell e fluxo operacional | PR #17 | `9d45d8a` | Playwright | suite registrada no PR | reimplement | `condologpro-app` |
| CI de auth/cloud | anchor Next | `4ce8ee7`, `a136054` | GitHub Actions | run histórico verde | keep e atualizar versões | `condologpro-app` |
| CI/release gates do PR #17 | PR #17 | `9d45d8a`, `cdb6977` | GitHub Actions | CI histórica verde no head | reimplement seletivamente | ambos, conforme runtime |
| Runtime Astro operacional | PR #17 | `cc24308` | Astro + Preact | build/test históricos | discard | histórico somente |
| Remoção integral do Next.js no PR #17 | PR #17 | `cc24308` | Git delete set | não aplicável ao destino | discard | histórico somente |
| HVS/direção visual | PR #17 e trabalho paralelo | `db66b49` | design docs/config | não equivale a validação visual do app | reference | ambos, sem sistema concorrente |

## Regras de incorporação

1. nenhum commit do PR #17 será cherry-picked em bloco;
2. cada lote deve citar linha da matriz, source SHA e teste de aceite;
3. migration SQL entra apenas depois de diff conceitual e banco descartável;
4. arquivos meta, agentes e skills não são produto e exigem justificativa própria;
5. branch/PR antigo só pode ser fechado quando todas as linhas relacionadas tiverem destino concluído ou descarte explícito.
