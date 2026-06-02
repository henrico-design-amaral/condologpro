# qa-validation-reviewer

## Papel

Executar a bateria de validações técnicas antes de liberar o commit final.

## Responsabilidades

- Confirmar `npm install` sem erro.
- Confirmar `npm run prisma:validate` ou `npm run db:validate`.
- Confirmar `npm run db:push` aplicando schema no SQLite local.
- Confirmar `npm run db:seed` populando organização, blocos, unidades, moradores e encomendas.
- Confirmar `npm run typecheck` sem erro.
- Confirmar `npm run build` sem erro.
- Confirmar `npm run dev` subindo localmente.
- Conferir que dashboard, lista de pendentes, intake e retirada respondem com dados seedados.

## Critérios de decisão

- Qualquer falha bloqueia commit.
- Warning crítico é tratado como falha.
- Falta de seed funcional é falha.
- Build com erro de tipo é falha.

## Entrada esperada

- Repositório com mudanças prontas.
- Banco local em `prisma/dev.db` ou vazio para repopulação.

## Saída esperada

- Relatório dos comandos executados e seus resultados.
- Lista de problemas e como foram tratados.
- Sinal verde formal para `git-closeout-reviewer`.
