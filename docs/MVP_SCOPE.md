# CondoLogPro — MVP Scope (v0.1)

## Visão

**Cloud-ready MVP** com **fallback local** para condomínios pequenos e médios registrarem a **entrada, notificação e retirada de encomendas** na portaria, com foto da etiqueta, autocomplete de moradores e um painel administrativo desktop.

> **Direção estratégica:** deploy padrão em **Vercel** + **Supabase Postgres** + **Supabase Storage**. O modo local (SQLite + `public/uploads`) é preservado para desenvolvimento, pilotos offline e contingência.

## Personas

- **Porteiro (mobile)**: registra a entrada da encomenda, tira foto da etiqueta, busca o morador, dispara o aviso (WhatsApp assistido) e baixa a retirada.
- **Síndico / administradora (admin desktop)**: consulta histórico, importa a base de moradores, audita o turno e gerencia o condomínio.

## Modos de operação

| Modo | Banco | Storage | Quando usar |
| --- | --- | --- | --- |
| **cloud (default)** | Supabase Postgres (`DATABASE_URL` pooled, `DIRECT_URL` para migrations) | Supabase Storage (`SUPABASE_STORAGE_BUCKET`) | Vercel preview, produção, piloto cloud |
| **local-fallback** | SQLite (`file:./dev.db`) | `public/uploads` | Desenvolvimento, piloto offline, validação sem credenciais |

> O modo é decidido por variáveis de ambiente. O código não finge conexão cloud sem credenciais reais.

## Fora de escopo (MVP)

- Autenticação complexa / SSO / multi-tenant rigoroso.
- Billing / pagamento.
- Integração nativa com WhatsApp Cloud API.
- OCR obrigatório na nuvem.
- Reconhecimento facial ou biometria.
- Multi-condomínio simultâneo em produção (a estrutura suporta, mas o MVP opera em **um** condomínio ativo).
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

### Locais (CI)
- `npm run prisma:validate` passa.
- `npm run typecheck` passa.
- `npm run build` passa (16/16 páginas estáticas).
- `npm run db:seed` popula 5 buildings, 50 units, 120 residents e 32 encomendas com mix de status.

### Cloud (manuais, com credenciais reais)
- Build na Vercel concluído a partir do branch `main` (ou branch de release).
- `prisma db push` contra Supabase Postgres executa sem erro.
- Upload de etiqueta contra Supabase Storage retorna URL pública (bucket público) ou URL assinada (bucket privado).
- O porteiro consegue registrar uma encomenda, gerar o link de WhatsApp e dar baixa em **menos de 90 segundos**.

### Produto
- O admin consegue filtrar atrasadas (>24h), abrir o histórico completo e exportar a base.
- A tela de portaria funciona com rede instável (UX tolerante a falhas; upload e notificação são reexecutáveis).

## Stack travada

- **Next.js 16 (App Router) + TypeScript strict + Tailwind**.
- **Prisma 6/7** com **dois schemas**:
  - `prisma/schema.prisma` → SQLite (local).
  - `prisma/schema.supabase.prisma` → PostgreSQL (cloud).
- **lucide-react** para ícones.
- **tesseract.js** carregado dinamicamente no cliente, sem custo fixo de bundle.
- **Zod** em endpoints sensíveis.
- **Vercel** para hosting e preview deploys.
- **GitHub Actions** para CI (typecheck + build, sem credenciais Supabase).
- **Supabase Storage** com fallback para `public/uploads`.
