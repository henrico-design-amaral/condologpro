# HANDOFF — CondoLogPro

## Decisão objetiva

O repositório atual é marketing-only. O produto operacional deve ser recuperado em `henrico-design-amaral/condologpro-app` a partir de `a136054`, incorporando capacidades do PR #17 de forma seletiva.

## Concluído na Phase 1

- refresh de Git e confirmação de `origin/main@9ec8071`;
- preservação do híbrido `4f131eb` em `fe328a8` e bundle externo;
- scan de segredos, PII e artefatos gerados nos 31 caminhos preservados;
- matriz de proveniência e ADR de separação;
- definição de uma autoridade de migrations;
- inventário Supabase somente leitura;
- reconciliação dos documentos de autoridade deste repositório.
- criação do repositório privado `henrico-design-amaral/condologpro-app` com `main@a136054`;
- início de `codex/phase-2-clean-recovery`, com instalação, Prisma, seed, testes, typecheck, build e smoke anônimo aprovados.
- CI do app aprovado, incluindo replay completo das migrations em PostgreSQL descartável.

## Evidência de infraestrutura

- Supabase `ricnsldmlnisleklmmch`, `sa-east-1`, PostgreSQL 17.6, status `INACTIVE`.
- A Edge Function `admin-invite-user`, versão 2, aparece como `ACTIVE` e `verify_jwt=true`.
- Listagem de migrations e tabelas falhou por timeout de conexão enquanto o projeto está inativo.
- Advisors retornaram sem lints, mas isso não prova o schema porque o banco não respondeu às leituras principais.
- Hostinger está configurado no Codex local, porém os comandos do conector não foram carregados nesta sessão. Não consigo confirmar inventário de planos, sites ou suporte do app sem nova sessão/conector disponível.

## Não executar ainda

- não restaurar ou substituir o Supabase;
- não aplicar migrations remotas;
- não publicar o app;
- não fechar PR #17, PR #13 ou branches antigas antes do registro final de destino;
- não remover o Next.js dormente da landing no mesmo lote documental.

## Próximo passo mínimo

Resolver as vulnerabilidades do app por upgrade controlado e reconciliar SQL/RLS do PR #17 com testes de tenancy, sem deploy.
