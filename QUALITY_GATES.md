# QUALITY GATES — CondoLogPro

## Gate 1 — Fundação

Aprovado somente se:

- pasta do projeto criada;
- arquivos de controle existem;
- Git local iniciado;
- nenhum app foi criado ainda;
- documentação inicial coerente.

## Gate 2 — Bootstrap técnico

Aprovado somente se:

- Next.js roda localmente;
- TypeScript sem erro;
- Prisma configurado;
- SQLite funcionando;
- seed executa;
- login/admin inicial funciona.

## Gate 3 — Fluxo mobile portaria

Aprovado somente se:

- tela mobile permite cadastrar pacote;
- permite anexar/fotografar etiqueta;
- permite buscar bloco/apto/morador;
- cria encomenda pendente;
- gera mensagem WhatsApp assistida.

## Gate 4 — Fluxo admin desktop

Aprovado somente se:

- admin visualiza encomendas;
- filtra por status;
- visualiza moradores;
- edita dados básicos;
- vê histórico de retirada.

## Gate 5 — Teste real controlado

Aprovado somente se:

- o fluxo completo funciona com dados simulados do condomínio;
- não depende de internet externa para funções core;
- pode ser usado em celular na mesma rede local;
- o operador consegue concluir entrada e retirada sem ajuda técnica.
