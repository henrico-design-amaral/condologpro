# GEMINI.md — CondoLogPro marketing

## Limite operacional

O repositório atual é a superfície comercial Astro. A aplicação operacional, seus dados e sua infraestrutura pertencem a `henrico-design-amaral/condologpro-app`.

## Hierarquia da verdade

1. instrução explícita do usuário;
2. `PROJECT_CONTROL.md` e `DECISIONS.md` deste repositório;
3. ADR e matriz de proveniência em `docs/architecture/`;
4. código Astro efetivamente usado pelo build;
5. histórico Git apenas como evidência, não como estado atual.

## Segurança e Git

- Não versionar credenciais, `.env` ou dados pessoais.
- Não operar Supabase nem deploy a partir desta árvore sem escopo explícito e validação local.
- Não misturar limpeza do legado, conteúdo, redesign e publicação no mesmo lote.
- Se faltar evidência, declarar: “Não consigo confirmar isso.”
