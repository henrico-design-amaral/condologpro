# DECISIONS — CondoLogPro

## Decisões históricas preservadas

- **2026-05-29 / 001:** validar primeiro o fluxo real de encomendas, sem software condominial genérico.
- **2026-05-29 / 002:** WhatsApp assistido por link/mensagem pronta no MVP.
- **2026-05-29 / 003:** OCR é opcional e sempre tem fallback manual.
- **2026-05-29 / 004:** a experiência mobile da portaria é prioridade operacional.

## 2026-08-10 — Decisão 005: separar marketing e aplicação

O site comercial permanece em `henrico-design-amaral/condologpro`, com Astro estático e domínio `condologpro.henrico.works`. A aplicação operacional passa a `henrico-design-amaral/condologpro-app`, com Next.js, TypeScript e domínio planejado `app.condologpro.henrico.works`.

Motivo: um repositório híbrido tornou build, deploy, documentação e fonte de verdade ambíguos. Monorepo não reduz o risco atual nem acelera receita.

## 2026-08-10 — Decisão 006: anchor operacional

`a136054` é o ponto de recuperação inicial porque contém o baseline Next.js com autenticação cloud, storage privado, migrations Prisma e CI historicamente verde. O commit é anchor, não estado final: dependências, meta-arquivos, arquitetura e runtime ainda precisam de validação atual.

## 2026-08-10 — Decisão 007: PR #17 é fonte seletiva

Serão reimplementados ou incorporados seletivamente o modelo de domínio, tenancy/RLS, SQL, testes de migration e segurança, PGlite, E2E, camera/OCR, idempotência, drafts, fallbacks de rede, concorrência e gates de QA. O runtime Astro operacional e a substituição integral do Next.js serão descartados.

## 2026-08-10 — Decisão 008: uma autoridade de banco

No app, `prisma/schema.supabase.prisma` representa o mapeamento ORM cloud e `prisma/migrations/` é o único ledger executável. RLS, funções, grants e políticas de Storage derivados do PR #17 serão SQL revisado dentro de migrations Prisma. `supabase/migrations/` do PR #17 permanece evidência de proveniência, não um segundo histórico aplicável.

`prisma db push` é proibido em ambientes compartilhados. Migrations remotas não serão executadas até comparação de schema, banco descartável, teste de tenancy e plano de rollback.

## 2026-08-10 — Decisão 009: preservar antes de limpar

O híbrido foi congelado em branch local e bundle externo antes de qualquer remoção. Branches e PRs antigos só podem ser encerrados quando a matriz de proveniência apontar destino ou descarte para suas capacidades.

## 2026-08-10 — Decisão 010: infraestrutura por evidência

O projeto Supabase `ricnsldmlnisleklmmch` será investigado antes de qualquer substituição. Hostinger e outro runtime serão comparados por suporte real a Node.js/Next.js, HTTPS, variáveis, logs, rollback, custo e tempo até receita. Nenhum deploy faz parte da Phase 1.

## 2026-08-10 — Decisão 011: HVS não compete com arquitetura

O trabalho visual pode avançar em paralelo apenas como baseline ou direção. Não será criado um sistema visual concorrente nem haverá redesign amplo durante a recuperação funcional.
