# PROJECT CONTROL — CondoLogPro

## Estado atual

Fase: MVP visual-first implementado e validado.

Status: Fluxo completo de encomendas funcionando — intake mobile, WhatsApp
assistido, confirmação de retirada, painel admin com métricas. Pronto para
teste operacional real.

## Caminho local

C:\Users\henri\Documents\04_PROJETOS_CONTEÚDO\01_ACTIVE\CondoLogPro

## Objetivo do projeto

Criar um MVP local-first para gestão de encomendas condominiais, validável em
teste real controlado no condomínio.

## Fluxo implementado

1. Portaria abre `/mobile`.
2. Toca em "Nova encomenda" → `/mobile/intake`.
3. Fotografa etiqueta (upload local para `public/uploads/labels/`).
4. Seleciona morador no selector agrupado por bloco.
5. Seleciona transportadora e adiciona observações.
6. Encomenda criada → redireciona para `/mobile/package/[id]`.
7. Toca em "Enviar WhatsApp" → abre wa.me com mensagem pronta.
8. Toca em "Marcar como avisado" → status NOTIFIED.
9. Na retirada, preenche nome/documento → status PICKED_UP.
10. Admin acessa `/admin` para visão operacional completa.

## Decisões técnicas

- Next.js App Router.
- TypeScript.
- Prisma.
- SQLite no MVP.
- Tailwind CSS.
- Upload local (`public/uploads/labels/`).
- WhatsApp assistido via wa.me.
- OCR não bloqueante.
- Mobile para portaria (dark mode, touch-first).
- Desktop para administração (light, enterprise).

## Branch atual

main

## Último marco

feat: implement visual-first mvp package flow — 2026-05-29.

## Próxima etapa

1. QA operacional com fluxo completo (ver PILOT_QA_CHECKLIST.md).
2. Testar acesso mobile na rede local: `npm run dev:host`.
3. Implementar busca/filtro na lista de pendentes.
4. Implementar importação CSV (/admin/import).
5. Criar repositório GitHub e subir main.
