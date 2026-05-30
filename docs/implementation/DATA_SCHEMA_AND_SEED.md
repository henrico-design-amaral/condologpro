# Data Schema and Seed — CondoLogPro

## Branch

data/add-condominium-schema-and-seed

## Objetivo

Criar a base de dados realista para o MVP local-first do CondoLogPro.

## Modelos criados

- Organization
- Building
- Unit
- Resident
- Operator
- Package
- PackageEvent

## Enums

- PackageStatus
- PackageEventType
- OperatorRole

## Seed

O seed cria:

- 1 condomínio demo;
- 5 blocos;
- 10 apartamentos por bloco;
- 2 a 3 moradores por apartamento;
- 3 operadores;
- 30 encomendas;
- eventos de recebimento, notificação e retirada.

## Validações

- npm run prisma:validate
- npm run prisma:generate
- npm run prisma:push
- npm run prisma:seed
- npm run typecheck
- npm run build

## Observação

O banco local `prisma/dev.db` não deve ser versionado.
