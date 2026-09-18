# AGENTS — CondoLogPro marketing

## HenricoOPS global inheritance

Este projeto herda obrigatoriamente o padrão global `henrico-design-amaral/henricoops:governance/ECOSYSTEM_DECISION_PROPAGATION_STANDARD.md`.

Toda decisão material do operador é `ecosystem-visible` e deve ser classificada pelo Orquestrador como `GLOBAL`, `DOMAIN`, `PROJECT`, `SURFACE` ou `TASK`.

- regras GLOBAL/DOMAIN aplicáveis são herdadas por este projeto;
- regras PROJECT/SURFACE permanecem específicas e não são copiadas cegamente para outros produtos;
- aprendizado portátil deve subir para HenricoOPS;
- nenhuma decisão durável pode existir apenas no chat/provider;
- regras locais podem especializar ou tornar mais estrita uma regra global, mas não enfraquecê-la silenciosamente.


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
