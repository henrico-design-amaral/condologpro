# Local-First Architecture — CondoLogPro MVP

## Objetivo

Definir a arquitetura técnica da primeira versão local-first do CondoLogPro.

## Direção técnica

O MVP deve rodar localmente no computador da administração ou notebook de teste, acessível por desktop e por celular na mesma rede local.

## Stack

- Next.js App Router
- TypeScript
- Prisma
- SQLite
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Local filesystem upload

## Por que local-first

A primeira validação deve priorizar:

- baixo custo;
- instalação simples;
- independência de infraestrutura cloud;
- controle sobre dados de teste;
- facilidade de rodar piloto local.

## Como acessar no celular

Rodar o servidor Next.js no computador.

Comando futuro:

    npm run dev -- --hostname 0.0.0.0

Depois acessar pelo IP local da máquina:

    http://IP_LOCAL:3000/mobile

Exemplo:

    http://192.168.0.10:3000/mobile

## Banco de dados

SQLite local.

Arquivo esperado:

    prisma/dev.db

Importante:

O banco não deve ser versionado no Git.

## Uploads

Fotos de etiquetas salvas em:

    public/uploads

A pasta deve existir, mas imagens reais não devem entrar no Git.

## API interna

O app usa API Routes do Next.js.

Não criar microsserviços.

## Auth

Para o primeiro MVP, auth pode ser simplificado.

Opções aceitas:

1. Sem login, com acesso local apenas.
2. Login simples com operador/admin.
3. Auth completa somente se não atrasar o MVP.

Recomendação:

Começar sem auth complexa e proteger por contexto local.

## Dados sensíveis

Mesmo em MVP, evitar expor dados reais sem necessidade.

Para piloto:

- usar dados anonimizados quando possível;
- usar poucos moradores reais inicialmente;
- não subir banco real para GitHub.

## Arquitetura lógica

Camadas:

1. UI mobile
2. UI admin desktop
3. API routes
4. validation schemas
5. Prisma ORM
6. SQLite
7. local uploads

## Princípios

- fluxo funcionando antes de abstração;
- simples antes de escalável;
- auditável antes de bonito;
- mobile da portaria antes do dashboard sofisticado;
- fallback manual antes de automação frágil.

## Futuro cloud

Quando o MVP validar:

- migrar SQLite para PostgreSQL;
- adicionar autenticação robusta;
- adicionar multi-tenant real;
- adicionar WhatsApp Cloud API;
- adicionar storage S3-compatible;
- adicionar deploy Vercel/Railway/Render.
