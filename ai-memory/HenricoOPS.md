# HenricoOPS — Memória Operacional: CondoLogPro

Memória operacional contínua do trabalho com Henrico. Fatos verificados, sem suposição não marcada.

## Caminhos de projeto (inegociável)
- CondoLogPro: `01_ACTIVE/CondoLogPro` (abs.: `C:\Users\henri\Documents\04_PROJETOS_CONTEÚDO\01_ACTIVE\CondoLogPro`)
- Repo Git: `https://github.com/henrico-design-amaral/condologpro.git` — branch principal `main`.

## Convenções confirmadas
- Todo prompt de projeto inicia com `/goal`.
- Mensagem de commit no padrão semântico: `type(scope): descrição`.
- Uma branch por objetivo; commits atômicos. Sem `git push` autônomos sem validação ou aprovação manual.
- Stack alvo: Next.js App Router (TypeScript), Prisma (SQLite local e Supabase Postgres remoto), Tailwind CSS, shadcn/ui.
- Banco de dados local default: SQLite.
- Banco de dados cloud: Supabase Postgres.
- Upload de imagens: `src/lib/storage.ts` gerencia fallback local (`public/uploads`) ou Supabase Storage.

## Estado real do projeto (auditado em 2026-06-23)
- O projeto está com uma feature inacabada em andamento na branch `feature/phase-2-auth-cloud-foundation`.
- As modificações locais dessa feature de autenticação e infraestrutura do Supabase foram salvas na pilha de stash do Git (SHA: `b3b16149f1358be1505f1985d1552438916f381e`) para permitir a aplicação limpa da governança.
- O build de produção local está estruturado para preparar o banco SQLite (`prisma:push` e `prisma:seed`) antes do build do Next.js via scripts no CI do GitHub Actions.

## Ciclo Phase 2 Auth/Cloud/Storage (2026-06-26)
- Branch `feature/phase-2-auth-cloud-foundation` publicada no GitHub.
- PR aberto contra `main`: `https://github.com/henrico-design-amaral/condologpro/pull/13` (`feat: add auth and storage cloud foundation`).
- CI remoto inicial: `PostgreSQL migrations`, Vercel e Vercel Preview Comments passaram; `Typecheck, validate, build` falhou em `npm run prisma:supabase:validate`.
- Causa verificada: o job principal do GitHub Actions definia `DATABASE_URL=file:./dev.db`, mas não definia `DIRECT_URL`, exigido por `prisma/schema.supabase.prisma`.
- Decisão técnica: usar `DIRECT_URL` placeholder local sem segredo real no job principal apenas para validação sintática do schema PostgreSQL; não usar Supabase remoto real.

## Pontos de atenção e limites de escopo
- **Credenciais de Produção**: Não há credenciais Supabase reais configuradas no ambiente local.
- **Segurança**: Nunca expor chaves de API privadas ou a service role key do Supabase. Chamadas de storage assinadas devem rodar estritamente server-side.
- **Acessibilidade/UI**: Manter a UI mobile extremamente focada em usabilidade rápida para o operador da portaria (targets grandes, cores escuras/dark mode de alto contraste, suporte para câmera física/fallback de upload).
- **Sem Scope Creep**: Não adicionar billing, WhatsApp Cloud API ou módulos genéricos fora do escopo principal de logística de pacotes condominiais.
