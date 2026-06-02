# visual-quality-review

## Quando usar

Antes de aprovar UI nova ou refatoração visual.

## Estética alvo

- Cockpit operacional, não CRUD genérico.
- Mobile: tema escuro de alto contraste, foco em ação rápida.
- Desktop: tema claro, denso, com tabelas legíveis.
- Tipografia direta, sem fontes decorativas.
- Espaçamento generoso entre seções, denso dentro de cards.

## Regras visuais

- Cards com `rounded-[8px]` consistente.
- Bordas neutras (`neutral-200` claro / `neutral-700` escuro).
- Status com cor + texto.
- Ações primárias com peso visual destacado.
- Ações secundárias com borda clara, sem competir com a primária.
- Sem gradientes em UI operacional.
- Sem sombras pesadas.
- Sem ilustrações decorativas que não comuniquem ação.

## Cores de status sugeridas

- `PENDING`: âmbar.
- `NOTIFIED`: azul.
- `PICKED_UP`: verde.
- `CANCELLED`: vermelho.
- `ATRASADO`: amarelo intenso ou âmbar com badge "atrasado".

## Densidade

- Mobile: 1 ação primária por bloco visível.
- Desktop: tabela compacta com filtros no topo.

## Saída

Lista de ajustes aplicados e screenshots descritos em texto.
