# TASKS — CondoLogPro recovery

## Phase 1 — Architecture Reconciliation

- [x] Confirmar superfícies, repositórios, domínios e runtimes.
- [x] Atualizar refs e reauditar o híbrido sujo.
- [x] Preservar 31 arquivos em branch local e bundle externo.
- [x] Provar a recuperação por hashes e `git bundle verify`.
- [x] Registrar matriz de proveniência por capacidade e SHA.
- [x] Escolher `a136054` como anchor, não como merge cego.
- [x] Definir PR #17 como fonte seletiva e rejeitar seu runtime Astro operacional.
- [x] Definir Prisma Migrate como ledger único.
- [x] Inventariar Supabase em leitura apenas.
- [ ] Inventariar Hostinger em leitura apenas quando o conector estiver carregado.
- [x] Reconciliar documentos de autoridade.
- [x] Definir plano de landing e de criação do app separado.

## Phase 2 — Clean operational recovery

- [x] Criar/confirmar `henrico-design-amaral/condologpro-app` privado.
- [x] Recuperar `a136054` sem copiar o híbrido atual.
- [x] Remover apenas resíduos meta não necessários, preservados em `main`.
- [x] Executar `npm ci` e registrar versões reais.
- [x] Validar Prisma local e cloud sem banco remoto.
- [x] Preparar PostgreSQL descartável no CI e aprovar migration deploy/status.
- [x] Rodar typecheck, testes, build e servidor local.
- [ ] Executar smoke autenticado para login, mobile intake, pendentes, retirada e admin; o smoke anônimo já passou.
- [ ] Reimplementar capacidades aprovadas do PR #17 em lotes pequenos.
- [ ] Registrar evidência e bloqueios; não fazer deploy de produção.

## Landing — lote posterior e separado

- [ ] Corrigir instalação determinística e CI da landing, se ainda falharem.
- [ ] Confirmar link seguro para o app.
- [ ] Remover Next.js dormente somente após prova de independência do build Astro.
- [ ] Verificar `condologpro.henrico.works` por HTTPS e conteúdo real antes de publicar.
