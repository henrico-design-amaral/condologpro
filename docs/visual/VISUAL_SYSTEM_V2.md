# CondoLogPro — Visual System v2

## Objetivo

Dar ao marketing uma referência visual viva sem criar um sistema concorrente ao produto operacional.

## Princípios

- produto acima de decoração;
- hero é o único ponto de escala tipográfica extrema;
- teal comunica avanço e confirmação;
- âmbar comunica espera, SLA e atenção;
- verde confirma conclusão;
- vermelho fica reservado a erro ou bloqueio;
- mobile prioriza ação e revisão humana;
- desktop prioriza fila, estado e rastreabilidade;
- dados de demonstração devem ser identificáveis como ilustrativos;
- nenhuma peça pode prometer automação não comprovada.

## Superfície de revisão

`/visual-system` é uma página interna, com `noindex,nofollow`, destinada a revisão do baseline visual da landing. Ela não substitui documentação do app e não introduz runtime operacional.

## Gate

Antes de merge: `npm ci`, `npm run check`, `npm run build`, revisão do output e smoke HTTPS quando houver ambiente de preview adequado.
