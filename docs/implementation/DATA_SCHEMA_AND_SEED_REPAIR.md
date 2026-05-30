# Data Schema and Seed Repair — CondoLogPro

## Branch

data/add-condominium-schema-and-seed

## Correções aplicadas

1. `package.json` foi reescrito em UTF-8 sem BOM.
2. `package-lock.json` foi normalizado para remover BOM, se existente.
3. `prisma/schema.prisma` foi mantido em UTF-8 sem BOM.
4. `prisma/seed.ts` foi reescrito sem depender de imports diretos dos enums do Prisma Client.
5. O Prisma Client deve ser regenerado após o schema completo.

## Motivo

O PowerShell estava gravando JSON com BOM invisível. Prisma, TSX e Turbopack falhavam ao parsear `package.json`.

## Validações obrigatórias

- `npm run prisma:validate`
- `npm run prisma:generate`
- `npm run prisma:push`
- `npm run prisma:seed`
- `npm run typecheck`
- `npm run build`