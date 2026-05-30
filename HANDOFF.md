# HANDOFF — CondoLogPro

## Estado atual

Branch: main  
Fase: MVP visual-first completo.

## O que foi implementado (2026-05-29)

### Fluxo mobile (portaria)

- `/mobile` — home com contadores (pendentes, avisadas, retiradas hoje).
- `/mobile/intake` — formulário de entrada: foto de etiqueta, seletor de
  morador agrupado por bloco, transportadora, observações.
- `/mobile/pending` — lista de encomendas PENDING + NOTIFIED com cards.
- `/mobile/package/[id]` — detalhe completo: dados do morador, foto da
  etiqueta, botão WhatsApp assistido, formulário de retirada, timeline de
  eventos.

### Painel admin (desktop)

- `/admin` — dashboard com 4 métricas, lista de recentes, atalhos rápidos.
- `/admin/packages` — tabela completa de encomendas com status badges.
- `/admin/residents` — tabela de moradores com bloco, apto, telefone, status.
- `/admin/import` — tela planejada com estrutura CSV esperada.
- `/admin/settings` — dados do condomínio e nota local-first.

### API

- `POST /api/upload` — upload de foto (jpg/png/webp, máx 5 MB).
- `POST /api/packages` — cria encomenda.
- `POST /api/packages/[id]/notify` — marca como avisado.
- `POST /api/packages/[id]/pickup` — confirma retirada.

### Infraestrutura

- `src/lib/data.ts` — todas as funções de acesso a dados.
- `src/lib/whatsapp.ts` — normalização de telefone, mensagem e URL wa.me.
- `src/components/StatusBadge.tsx` — badge de status (light + dark).
- `src/components/MetricCard.tsx` — card de métrica (light + dark).
- `src/components/EmptyState.tsx` — estado vazio.
- `src/app/admin/layout.tsx` — layout com nav admin.

## Para retomar

```bash
cd C:\Users\henri\Documents\04_PROJETOS_CONTEÚDO\01_ACTIVE\CondoLogPro
npm run prisma:seed   # se banco estiver vazio
npm run dev
```

Acesse:
- Portaria mobile: http://localhost:3000/mobile
- Admin desktop: http://localhost:3000/admin

## Próximas ações prioritárias

1. QA operacional completo usando `docs/qa/PILOT_QA_CHECKLIST.md`.
2. Testar acesso mobile por IP: `npm run dev:host` → abrir no celular.
3. Implementar busca/filtro na lista de pendentes (próxima feature).
4. Implementar importação CSV real em `/admin/import`.
5. Criar repositório GitHub remoto.

## Limitações conhecidas

- Sem autenticação — qualquer pessoa com acesso à rede pode operar.
- Sem busca/filtro nas listas (próxima iteração).
- Importação CSV é tela planejada, lógica não implementada.
- OCR de etiqueta não implementado (foto é armazenada, não parseada).
- WhatsApp delivery não verificável — operador confirma manualmente.
- Dados são locais; backup manual recomendado (`prisma/dev.db`).

## Contexto essencial

CondoLogPro substitui o caderno físico de controle de encomendas e o WhatsApp
manual. O fluxo deve ser mais rápido que o processo atual, não mais lento.
Cada tela mobile foi projetada para operação em 10 a 30 segundos.
