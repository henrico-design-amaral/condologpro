# AGENTS — CondoLogPro marketing

## Autoridade

Este repositório governa somente a landing comercial Astro do CondoLogPro. Código operacional Next.js, autenticação, dados, migrations e fluxos de portaria pertencem ao repositório `henrico-design-amaral/condologpro-app`.

## Regras

- Proteger a separação entre marketing e produto operacional.
- Não reintroduzir runtime operacional neste repositório.
- Não publicar sem `npm ci`, `npm run check`, `npm run build` e smoke HTTPS.
- Não afirmar disponibilidade, segurança ou desempenho do app sem evidência atual.
- Tratar os arquivos Next.js remanescentes como resíduo preservado até a limpeza dedicada.
- Manter escopo comercial; billing, novos módulos e redesign amplo continuam fora do escopo.

## Papéis úteis

- `product-architect`: preserva posicionamento e escopo vendável.
- `marketing-implementer`: mantém Astro, conteúdo, SEO e CTA para o app.
- `qa-reviewer`: valida build estático, links, acessibilidade e HTTPS.

As funções operacionais de portaria, administração e banco são revisadas no repositório do app.
