# Diagnóstico inicial da reconstrução Astro + Supabase

Data: 2026-08-01

## Decisão objetiva

O `origin/main` é a fonte canônica de código. A branch local antiga `feature/phase-2-auth-cloud-foundation` não pode receber esta reconstrução: ela está cinco commits à frente e dois atrás de `origin/main`, e o PR #13 está aberto com estado de merge `DIRTY`.

A nova execução parte de `origin/main` em `codex/rebuild-astro-supabase`. O escopo é exclusivamente o CondoLogPro.

## Evidência de repositório

- Caminho canônico: `C:\Users\henri\Documents\04_PROJETOS_CONTEÚDO\01_ACTIVE\CondoLogPro`.
- Repositório: `henrico-design-amaral/condologpro`.
- Branch principal: `main`.
- `origin/main`: `8e8e14a`, deploy Hostinger.
- PR #15 mesclado: reconstrução visual Astro.
- PR #16 mesclado: workflow Hostinger.
- Domínio registrado no Astro e no PR: `https://condologpro.henrico.works`.
- A configuração local `.claude/settings.local.json` é preexistente e fica ignorada, fora do lote.

## Estado funcional encontrado

### Astro

- Astro é a fundação de build no `main`, mas a única rota canônica é uma página estática de apresentação.
- A página descreve fluxo, telas e métricas; não autentica, não persiste e não executa recebimento ou retirada.
- A dependência estava em Astro 5, enquanto a fonte oficial atual e o MotoristaOps já usam Astro 7.

### Legado Next, Prisma, SQLite e Vercel

- O repositório ainda contém `src/app`, componentes React/Next, rotas API, `next.config.ts`, `next-env.d.ts`, Prisma, `vercel.json` e documentação de Vercel.
- Esse código não participa do build Astro atual, mas cria duas arquiteturas concorrentes.
- O SQLite local contém somente seed demonstrativa: 1 condomínio demo, 5 blocos, 50 unidades, 120 moradores, 32 encomendas e 65 eventos.
- Assinaturas do seed confirmadas: 32 códigos `CLP-*`, 120 nomes numerados e um único telefone distinto. Não há evidência de dados reais a migrar.

### Supabase

- Existe um projeto canônico chamado `condologpro` em `sa-east-1`, atualmente `INACTIVE`.
- O conector Supabase está autenticado, mas o projeto ainda não foi restaurado nem alterado nesta fase de inventário.
- Os valores Supabase no `.env.local` estão vazios; nenhuma credencial real foi lida ou impressa.
- O repositório GitHub não possui secrets ou variables Supabase listados no inventário atual.

### GitHub e Hostinger

- Existem cinco secrets Hostinger com nomes `HOSTINGER_HOST`, `HOSTINGER_USERNAME`, `HOSTINGER_PASSWORD`, `HOSTINGER_PORT` e `HOSTINGER_TARGET_DIR`.
- O workflow mesclado espera `HOSTINGER_SSH_PASSWORD`, nome que não existe, e usa host, usuário, porta e diretório hardcoded.
- Portanto, o deploy atual pode construir, mas não há prova de que publicou. A correção deve adotar o mesmo contrato de secrets já validado no MotoristaOps.

## Fonte canônica de produto

Precedência aplicada:

1. `/goal` de 2026-08-01.
2. HenricoOPS, Capability Router e Sellable MVP Gate.
3. `docs/MVP_SELLABLE_SCOPE.md`, `docs/PRODUCT_DECISIONS.md` e decisões operacionais.
4. conteúdo e seed reais.
5. implementação legada.

Conflitos resolvidos:

- Astro + Supabase substituem Next + Prisma + SQLite + Vercel.
- O fallback preservado é manual e resiliente, não um segundo banco SQLite de runtime.
- WhatsApp continua assistido; abrir o aplicativo nunca equivale a envio confirmado.
- OCR continua assistivo e não bloqueante.
- Login de morador continua fora do MVP.
- Multi-tenancy passa a ser estrutural e comprovada por RLS, embora o primeiro uso seja de um condomínio.

## Capacidade e ambiente

- Capability Router executado para `product_feature`, `frontend_visual`, `cloud_ops` e `release_pr`, todos com risco alto solicitado.
- Skills ativas: Supabase, Impeccable, Playwright e GitHub publish.
- Node, npm e npx estão disponíveis.
- Docker e Supabase CLI global não estão disponíveis.
- Validação SQL local precisará de runtime Postgres embutido/CI ou do ambiente Supabase isolado; produção não será usada como banco de desenvolvimento.

## Riscos que bloqueiam publicação

- Supabase inativo e schema remoto ainda desconhecido.
- Nenhum usuário de teste confirmado no Auth.
- Nenhuma variável pública Supabase configurada no GitHub.
- Workflow Hostinger incompatível com os secrets existentes.
- Câmera física em HTTPS ainda não validada.
- Nenhuma baseline funcional existe; o `main` atual é apresentação estática.

## Critério para iniciar implementação

Implementação pode começar porque o alvo, a fonte canônica, o estado do Git, o conteúdo do SQLite, o projeto Supabase e o contrato Hostinger foram inventariados. Nenhum dado real ou secret foi exposto. Publicação continua bloqueada até migrations, RLS, Storage, testes, build e fluxo local passarem.
