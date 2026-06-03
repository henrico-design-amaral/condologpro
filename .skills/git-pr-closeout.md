# git-pr-closeout

## Quando usar

Antes do commit final que fecha uma sprint de implementação.

## Procedimento

1. Rodar `git status -sb`.
2. Conferir que somente arquivos esperados foram alterados.
3. Conferir `.gitignore` cobrindo `prisma/dev.db`, `.env`, `public/uploads/*`, `node_modules/`, `.next/`.
4. Rodar pipeline mínima de validação:
   - `npm run prisma:validate`
   - `npm run typecheck`
   - `npm run build`
5. Compor mensagem de commit clara, Conventional Commits.
6. Executar commit.
7. Rodar `git status -sb` novamente e confirmar working tree limpo.

## Padrão de mensagem

- `feat:` para nova funcionalidade.
- `fix:` para correção.
- `docs:` para documentação isolada.
- `chore:` para infra/script.
- `refactor:` para mudança interna sem efeito visível.

## Recusas automáticas

- Sem mensagem.
- Sem escopo.
- Arquivos não relacionados em paralelo.
- Banco local versionado.
- Segredo em diff.

## Saída esperada

- Hash do commit registrado.
- `git status` limpo.
- Relatório curto: branch, arquivos, validações, pendências.
