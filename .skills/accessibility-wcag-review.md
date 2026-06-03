# accessibility-wcag-review

## Quando usar

Antes de marcar uma tela como pronta para piloto operacional.

## Checklist mínimo

- Contraste de texto ≥ 4.5:1 para corpo, ≥ 3:1 para títulos grandes.
- Foco visível obrigatório em botões, links e inputs (`focus-visible`).
- Ícones decorativos com `aria-hidden="true"`.
- Ícones funcionais com `aria-label`.
- Labels de formulário associados ao input correspondente.
- Estados de loading, erro e vazio com mensagem em texto humano.
- Hit area mínima de 44x44px no mobile.
- Cor nunca é o único indicador de status (texto + cor).
- Navegação por teclado funcional em telas admin.
- `lang="pt-BR"` no HTML.

## Padrão de mensagens

- Erro: explicar causa e próximo passo.
- Empty: explicar o que acontecerá quando houver dado.
- Loading: indicar o que está sendo carregado.

## Itens proibidos

- Spinner sem texto.
- Botão só com ícone sem `aria-label`.
- Toast crítico em cinza claro sobre fundo claro.
- Tabela sem header semântico.

## Saída

Relatório com itens auditados e ajustes aplicados.
