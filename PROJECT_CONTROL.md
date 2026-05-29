# PROJECT CONTROL — CondoLogPro

## Estado atual

Fase: Documentação operacional e prompts Claude Code.

Status: Fundação criada. PDR, arquitetura, plano de implementação, prompts, agents e skills foram preparados. App ainda não iniciado.

## Caminho local

C:\Users\henri\Documents\04_PROJETOS_CONTEÚDO\01_ACTIVE\CondoLogPro

## Objetivo do projeto

Criar um MVP local-first para gestão de encomendas condominiais, validável em teste real controlado no condomínio.

## Fluxo-base

Portaria/administração recebe pacote > fotografa etiqueta > registra entrada > associa bloco/apto/morador > gera WhatsApp assistido > baixa retirada.

## Decisões técnicas

- Next.js App Router.
- TypeScript.
- Prisma.
- SQLite no MVP.
- Tailwind CSS + shadcn/ui.
- Upload local.
- WhatsApp assistido via wa.me.
- OCR não bloqueante.
- Mobile para portaria.
- Desktop para administração.

## Branch atual

main

## Último marco

Fundação documental inicial criada no commit f1e5692.

## Próxima etapa

Parte 3: criar repositório remoto no GitHub e/ou iniciar bootstrap técnico do app Next.js.

Recomendação:
Criar GitHub antes do bootstrap técnico para preservar histórico desde a documentação.
