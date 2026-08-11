# PROJECT CONTROL — CondoLogPro

## Estado atual

Fase: **Phase 1 — Architecture Reconciliation**.

Status: superfícies separadas e repositório operacional criado. Este repositório é marketing Astro; `henrico-design-amaral/condologpro-app` é privado, possui `main@a136054` e iniciou a recuperação em `codex/phase-2-clean-recovery`.

## Autoridade por superfície

| Superfície | Autoridade | Domínio | Runtime |
| --- | --- | --- | --- |
| Marketing | `henrico-design-amaral/condologpro` | `condologpro.henrico.works` | Astro estático |
| Operacional | `henrico-design-amaral/condologpro-app` | `app.condologpro.henrico.works` | Next.js + TypeScript, Node.js |

O domínio operacional só pode ser considerado ativo depois de build, ambiente, HTTPS e smoke test reais. Não consigo confirmar isso no estado atual.

## Decisões de recuperação

- `origin/main@9ec8071` é a autoridade atual da landing.
- `a136054` é o anchor de recuperação operacional, não uma aprovação automática de todo o seu conteúdo.
- PR #17 (`codex/rebuild-astro-supabase`) é fonte seletiva de modelo de domínio, SQL/RLS, migrations, testes, camera/OCR, drafts, idempotência, fallbacks e QA.
- O runtime Astro operacional do PR #17 não será integrado ao app.
- Prisma Migrate será o único ledger executável de migrations do app. SQL útil do PR #17 será incorporado, revisado e versionado dentro desse ledger.
- O projeto Supabase candidato é `ricnsldmlnisleklmmch`, região `sa-east-1`, atualmente `INACTIVE`. Nenhum projeto substituto será criado sem concluir a investigação.
- Hosting do app permanece em decisão baseada em evidência; não há deploy autorizado nesta fase.

## Preservação

O híbrido sujo de `codex/rebuild-astro-supabase@4f131eb` foi preservado antes de qualquer limpeza:

- branch local: `preservation/phase1-hybrid-20260810`;
- commit: `fe328a8fa6fd333a62bc20160f21d66bc7be40dc`;
- bundle externo e inventário: `_RECOVERY/CondoLogPro/2026-08-10-phase1` fora da árvore ativa;
- prova: 31 arquivos conferidos por hash, sem divergência.

## Resíduos conhecidos neste repositório

- Arquivos Next.js e documentação histórica ainda coexistem em `main`.
- `package.json` define Astro como runtime efetivo.
- A limpeza será um lote posterior, depois de o app separado estar rastreável e o build da landing ser determinístico.

## Próximo gate

1. validar e publicar esta reconciliação documental em PR isolado;
2. manter `condologpro-app/main` como anchor de recuperação;
3. resolver vulnerabilidades e reconciliar SQL/RLS do PR #17 sobre o ledger PostgreSQL já validado no CI;
4. configurar Auth apenas em ambiente isolado e repetir o smoke autenticado;
5. não fazer deploy de produção.
