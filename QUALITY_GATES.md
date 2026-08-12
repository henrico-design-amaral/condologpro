# QUALITY GATES — CondoLogPro

## Gate comum de abertura

- confirmar repositório, branch, remote, HEAD e working tree;
- ler `PROJECT_CONTROL.md`, `DECISIONS.md`, `HANDOFF.md` e a ADR vigente;
- bloquear trabalho operacional no repositório de marketing;
- bloquear marketing no repositório operacional, salvo link/documentação estritamente necessária.

## Segurança e proveniência

- nenhum `.env`, segredo, foto ou dado real de morador no Git;
- mudanças recuperadas devem apontar source ref, SHA e decisão `keep`, `reimplement` ou `discard`;
- PR/branch antigo só fecha depois de a capacidade ter destino registrado;
- migration remota, restauração de projeto, deploy e produção exigem gate próprio e evidência local.

## Marketing — `condologpro`

Gate mínimo antes de publicação:

```powershell
npm ci
npm run check
npm run build
```

Depois do build: inspecionar output estático, links, CTA do app, conteúdo responsivo e ausência de dependência operacional. A publicação só passa com HTTPS real e cópia identificável no domínio.

## Aplicação — `condologpro-app`

Gate inicial da recuperação:

1. checkout limpo e proveniência do anchor;
2. instalação determinística;
3. `prisma validate` para schemas aplicáveis;
4. migrations em PostgreSQL descartável, nunca produção;
5. typecheck e lint;
6. testes unitários, auth, tenancy, idempotência e migrations;
7. build Next.js;
8. servidor local;
9. smoke no navegador dos fluxos críticos;
10. revisão de diff, segredos e artefatos gerados.

## Banco

- `prisma/migrations/` é o ledger único do app;
- `prisma db push` é permitido somente para SQLite local descartável;
- SQL de RLS, grants, RPCs e Storage deve estar versionado no mesmo ledger;
- toda tabela multi-tenant exige `organization_id`, índice adequado e teste negativo entre tenants;
- funções `security definer` exigem `search_path` explícito, checagem de identidade e grants mínimos;
- nenhuma migration é marcada como aplicada sem comparação do schema real.

## UX operacional

O gate vendável exige evidência para:

- login de operador e bloqueio por papel;
- entrada mobile com foto ou arquivo;
- OCR opcional com confirmação humana;
- busca de unidade/morador;
- criação idempotente;
- WhatsApp assistido sem alegar envio automático;
- pendentes e retirada com histórico;
- estados vazio, loading, erro, retry e perda de rede;
- admin desktop.

## Fechamento

- `git diff --check`;
- staging cirúrgico;
- commit atômico;
- PR com comandos executados e limites não verificados;
- sem merge com checks falhando;
- sem alegar cloud, HTTPS, câmera física ou produção quando não foram testados.
