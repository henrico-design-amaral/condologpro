# resident-autocomplete

## Quando usar

Ao revisar ou corrigir a busca de moradores em qualquer fluxo (intake, pending, admin).

## Regras de busca

- Query mínima de 2 caracteres.
- Buscar por nome, bloco, apartamento e telefone (dígitos normalizados).
- Resultado retorna no máximo 12 itens.
- Ordenar por morador principal primeiro, depois nome ASC.
- Tolerante a acento via `contains` (SQLite default).
- API: `GET /api/residents/search?q=...` retorna `{ residents: [...] }`.

## Schema do resultado

Cada item contém:

- `id`
- `unitId`
- `name`
- `phone` (pode ser `null`)
- `isPrimary`
- `buildingLabel`
- `unitNumber`

## UX

- Input grande (mínimo 48px de altura).
- Ícone de busca visível.
- Loading com texto humano ("Buscando moradores...").
- Itens com hit-area generoso (mínimo 72px de altura).
- Destaque para morador principal com badge "Principal".

## Erros

- Falha de rede deve mostrar texto humano, nunca pilha de erro.
- Lista vazia após 2+ caracteres deve sugerir variações: tentar bloco, apto, telefone.

## Saída

Busca usada em `/mobile/intake` e replicável em `/admin/residents` com mesma API.
