# prisma-sqlite-validation

## Quando usar

Antes de aceitar mudanças no schema, seed ou queries Prisma.

## Comandos esperados

- `npm run prisma:validate` — valida o schema atual contra o SQLite.
- `npm run db:validate` — alias amigável de `prisma:validate`.
- `npm run db:push` — aplica o schema no `prisma/dev.db`.
- `npm run db:seed` — popula banco com organização, blocos, unidades, moradores e encomendas.

## Estado esperado após seed

- Organização: 1 (`Condomínio Demo CondoLogPro`).
- Blocos: 5.
- Unidades: pelo menos 50.
- Moradores: pelo menos 120 (telefones todos `+55 11 953970704`).
- Encomendas: pelo menos 30 distribuídas entre `PENDING`, `NOTIFIED` e `PICKED_UP`.
- Eventos: pelo menos 1 por encomenda + extras para notificação e retirada.

## Validações de dado

- Toda `Unit` tem `buildingId` e `organizationId`.
- Todo `Resident` tem `unitId` e `organizationId` e `phone` válido.
- Toda `Package` tem `unitId` e `organizationId`, com `residentId` opcional.
- Status sempre em `PackageStatus` válido.

## Falhas comuns

- Esquecer `organizationId` em criação manual.
- Quebrar relação `Unit` ↔ `Building`.
- Trocar `delete cascade` por delete simples.

## Saída

`docs/IMPLEMENTATION_LOG.md` registra o resultado do `db:seed` mais recente.
