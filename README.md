# CondoLogPro — site comercial

Este repositório é a autoridade da superfície pública de marketing do CondoLogPro.

## Limite de responsabilidade

- Repositório: `henrico-design-amaral/condologpro`
- Domínio: `https://condologpro.henrico.works`
- Runtime: Astro estático
- Responsabilidade: proposta de valor, demonstração visual, conversão e acesso ao produto
- Não contém a aplicação operacional autoritativa nem é fonte de verdade de banco, autenticação ou migrations

A aplicação operacional vive em `henrico-design-amaral/condologpro-app` e terá como domínio canônico `https://app.condologpro.henrico.works` quando houver ambiente validado. Até essa validação, nenhum texto deste site deve afirmar que o app está disponível em produção.

## Desenvolvimento local

```powershell
npm ci
npm run check
npm run build
```

O gate de publicação exige instalação determinística, `check`, `build`, inspeção do artefato estático e smoke test HTTPS no domínio público.

## Estado legado

Arquivos Next.js ainda presentes na árvore de `main` são resíduo histórico, não runtime alternativo. Eles só podem ser removidos em lote próprio depois de:

1. preservar a proveniência;
2. confirmar o link do repositório operacional;
3. validar o build Astro sem dependência desses arquivos;
4. revisar o diff de remoção.

Consulte [PROJECT_CONTROL.md](PROJECT_CONTROL.md), [DECISIONS.md](DECISIONS.md) e [docs/architecture/PHASE_1_PROVENANCE_MATRIX.md](docs/architecture/PHASE_1_PROVENANCE_MATRIX.md).
