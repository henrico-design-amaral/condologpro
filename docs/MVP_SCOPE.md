# CondoLogPro — MVP Scope (v0.1)

## Visão

Software **offline-first** para condomínios pequenos e médios registrarem a **entrada, notificação e retirada de encomendas** na portaria, com foto da etiqueta, autocomplete de moradores e um painel administrativo desktop.

> Princípio: **rodar 100% local** (SQLite + uploads em `public/uploads`), sem dependência de serviços externos para o MVP.

## Personas

- **Porteiro (mobile)**: registra a entrada da encomenda, tira foto da etiqueta, busca o morador, dispara o aviso (WhatsApp assistido) e baixa a retirada.
- **Síndico / administradora (admin desktop)**: consulta histórico, importa a base de moradores, audita o turno e gerencia o condomínio.

## Fora de escopo (MVP)

- Autenticação complexa / SSO / multi-tenant rigoroso.
- Billing / pagamento.
- Integração nativa com WhatsApp Cloud API.
- OCR obrigatório na nuvem.
- Reconhecimento facial ou biometria.
- Multi-condomínio simultâneo (a estrutura suporta, mas o MVP opera em **um** condomínio ativo).
- Substituição da planilha para grandes operações (acima de ~500 unidades/dia).

## Funcionalidades no MVP

### Portaria (mobile-first, dark UI)
- Lista de **pendentes** com busca, filtro por status e checkbox "atrasadas (>24h)".
- **Nova encomenda**: foto da etiqueta (câmera direta ou upload), OCR opcional (tesseract.js, pt-BR), busca de morador por nome/bloco/apto/telefone, edição rápida, criação da encomenda e geração de link `wa.me` com mensagem pronta.
- **Detalhe da encomenda**: foto, dados do morador, status, histórico, ações de **notificar**, **confirmar retirada** (com nome e documento) e **abrir WhatsApp**.

### Admin (desktop, light UI)
- **Painel** com 4 KPIs primários (hoje, ontem, pendentes, avisadas) e 3 secundários (atrasadas, tempo médio de retirada, moradores ativos).
- **Pacotes**: listagem com busca, filtros de status, filtro de atrasadas, ações em massa e detalhe por evento.
- **Moradores**: busca por nome, telefone, bloco e apto; status principal/vinculado.
- **Histórico**: timeline com filtros (busca, bloco, status, período) e lista de eventos por pacote.
- **Importação**: CSV com `preview` e `commit` via endpoint Zod, criando buildings, units e residents sob demanda.
- **Configurações**: nome do condomínio, telefone WhatsApp, descrição de regras.

## Critérios de aceite do MVP

- `npm run typecheck` e `npm run build` passam em CI.
- `npm run db:seed` popula 5 buildings, 50 units, 120 residents e 32 encomendas com mix de status.
- O porteiro consegue registrar uma encomenda, gerar o link de WhatsApp e dar baixa em **menos de 90 segundos** em fluxo guiado.
- O admin consegue filtrar atrasadas (>24h), abrir o histórico completo e exportar a base.
- A tela de portaria funciona **offline** após o primeiro carregamento (PWA-ready, sem chamadas bloqueantes).

## Stack travada

- **Next.js 16 (App Router) + TypeScript strict + Tailwind**.
- **Prisma 7** com **SQLite** local (`prisma/dev.db`).
- **lucide-react** para ícones.
- **tesseract.js** carregado dinamicamente no cliente, sem custo fixo de bundle.
- **Zod** em endpoints sensíveis.
- `public/uploads` para fotos de etiqueta (storage local; adapter para Supabase Storage fica fora do MVP).
