# Bootstrap Repair Notes — CondoLogPro

## Branch

bootstrap/nextjs-local-first-foundation

## Correções aplicadas

1. tsconfig.json reescrito sem BOM invisível.
2. prisma/schema.prisma reescrito sem BOM invisível.
3. Prisma e @prisma/client estabilizados no major 6.
4. tsconfig.tsbuildinfo removido do versionamento e adicionado ao .gitignore.

## Validações executadas

- npm run prisma:validate
- npm run typecheck
- npm run build

## Resultado

Bootstrap técnico validado. O app Next.js compila, TypeScript passa, Prisma valida e as rotas base de mobile/admin estão disponíveis.
