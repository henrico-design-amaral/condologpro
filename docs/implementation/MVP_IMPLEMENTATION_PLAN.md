# MVP Implementation Plan — CondoLogPro

## Fase 0 — Bootstrap técnico

Objetivo:

Criar app Next.js funcional com TypeScript, Tailwind, shadcn/ui, Prisma e SQLite.

Entregáveis:

- package.json
- Next.js App Router
- Tailwind configurado
- Prisma configurado
- SQLite funcionando
- seed executável
- layout mobile
- layout admin
- página inicial redirecionando

Critério de aceite:

    npm run dev

abre o app sem erro.

## Fase 1 — Banco e seed

Objetivo:

Criar schema inicial e dados de teste.

Entidades:

- Organization
- Building
- Unit
- Resident
- Package
- PackageEvent
- Operator

Critério de aceite:

    npx prisma db push
    npx prisma db seed

criam dados realistas.

## Fase 2 — Admin desktop básico

Objetivo:

Permitir controle da base.

Telas:

- /admin
- /admin/residents
- /admin/packages
- /admin/import
- /admin/settings

Critério de aceite:

Admin visualiza moradores, pacotes e dashboard básico.

## Fase 3 — Mobile portaria

Objetivo:

Criar fluxo operacional da portaria.

Telas:

- /mobile
- /mobile/intake
- /mobile/pending
- /mobile/package/[id]

Critério de aceite:

Operador registra pacote pelo celular.

## Fase 4 — WhatsApp assistido

Objetivo:

Gerar mensagem pronta e link para WhatsApp.

Funções:

- formatPhoneBR
- buildPackageNotificationMessage
- buildWhatsAppUrl

Critério de aceite:

Botão abre WhatsApp com texto pronto.

## Fase 5 — Retirada digital

Objetivo:

Baixar pacote e registrar evento.

Critério de aceite:

Pacote sai de pendente/notificado para retirado, com timestamp.

## Fase 6 — QA operacional

Objetivo:

Testar ponta a ponta.

Checklist:

1. Criar morador.
2. Criar pacote.
3. Anexar foto.
4. Gerar WhatsApp.
5. Visualizar pendente.
6. Baixar retirada.
7. Consultar histórico no admin.

## Fase 7 — GitHub

Objetivo:

Criar repo remoto e subir versão foundation/MVP.

Somente depois do bootstrap ou documentação consolidada.
