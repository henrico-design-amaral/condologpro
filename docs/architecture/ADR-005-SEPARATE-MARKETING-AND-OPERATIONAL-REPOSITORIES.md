# ADR-005 — separar marketing e aplicação operacional

- Status: accepted
- Data: 2026-08-10
- Decisores: CondoLogPro recovery / HenricoOPS

## Contexto

O repositório `condologpro` acumulou três estados incompatíveis: uma aplicação Next.js validada historicamente, uma reconstrução operacional Astro/Supabase no PR #17 e uma landing Astro publicada em `main`. Arquivos de ambos os runtimes permaneceram misturados, o lockfile deixou de representar de forma confiável o manifesto ativo e a documentação passou a descrever branches e infraestrutura diferentes.

## Decisão

Manter duas autoridades independentes:

| Responsabilidade | Repositório | Domínio | Stack |
| --- | --- | --- | --- |
| Marketing | `henrico-design-amaral/condologpro` | `condologpro.henrico.works` | Astro estático |
| Aplicação | `henrico-design-amaral/condologpro-app` | `app.condologpro.henrico.works` | Next.js + TypeScript + Node.js |

Não será adotado monorepo. `a136054` é o anchor inicial do app. PR #17 é uma biblioteca de proveniência: capacidades aprovadas serão reimplementadas; seu runtime Astro operacional não será integrado.

No app, Prisma Migrate será o ledger único. SQL útil de RLS, grants, funções e Storage será incorporado em migrations Prisma revisadas. Não haverá dois históricos executáveis concorrentes.

## Consequências positivas

- build, domínio, deploy e ownership deixam de ser ambíguos;
- marketing pode evoluir sem carregar banco e autenticação;
- o app recupera uma baseline Next validada sem merge cego do híbrido;
- provenance e descarte ficam explícitos por capacidade;
- a escolha de hosting passa a depender do runtime operacional real.

## Custos e riscos

- dois repositórios exigem links, issues e release gates separados;
- o histórico antigo precisa ser encerrado gradualmente;
- resíduos Next na landing exigem limpeza posterior;
- commits do PR #17 precisam ser minerados e testados, não cherry-picked em bloco;
- domínio e ambiente do app continuam não confirmados até smoke HTTPS.

## Alternativas rejeitadas

### Manter o híbrido

Rejeitado porque conserva dois runtimes, dois modelos de deploy e documentação contraditória.

### Monorepo

Rejeitado porque adiciona coordenação e tooling sem resolver o risco principal nem acelerar o primeiro fluxo vendável.

### Adotar integralmente o PR #17

Rejeitado porque a reconstrução troca o runtime aprovado, apaga a baseline Next e mistura ganhos de dados/QA com uma decisão de frontend não autorizada.

### Criar novo projeto Supabase imediatamente

Rejeitado porque já existe `ricnsldmlnisleklmmch`; substituição sem inventário perderia continuidade e aumentaria custo/risco.

## Critério de revisão

Reavaliar apenas se a separação impedir um gate vendável comprovado ou se o custo operacional de dois repositórios superar o benefício com evidência mensurável.
