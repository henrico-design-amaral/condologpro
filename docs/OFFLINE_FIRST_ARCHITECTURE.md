# Offline-First Architecture

## Princípios

1. **Local é a fonte primária.** O app deve funcionar mesmo sem rede, lendo e escrevendo contra `prisma/dev.db` e `public/uploads`.
2. **Sem dependência externa no caminho feliz.** OCR, uploads e busca de morador rodam no próprio processo do Next.js.
3. **Reconciliação é optativa.** Tudo o que tocar rede (Supabase Storage, WhatsApp Cloud) é um *enhancement* plugado depois, nunca um pré-requisito.

## Camadas

```
┌──────────────────────────────────────────────────────────────┐
│  UI (Next.js App Router, RSC + Client)                       │
│  ├── /mobile/*  → fluxo do porteiro (dark, offline-first)    │
│  └── /admin/*   → fluxo do síndico (light, denso)            │
├──────────────────────────────────────────────────────────────┤
│  Server actions / Route Handlers                             │
│  ├── /api/packages, /api/residents/search                    │
│  ├── /api/packages/[id]/{notify,pickup}                      │
│  ├── /api/upload/label → /public/uploads/...                 │
│  └── /api/import/residents → CSV preview + commit            │
├──────────────────────────────────────────────────────────────┤
│  Domain libs                                                 │
│  ├── stats.ts     → métricas, OVERDUE_THRESHOLD_HOURS = 24   │
│  ├── format.ts    → datas, horas relativas, números          │
│  ├── whatsapp.ts  → montagem de wa.me + mensagens prontas    │
│  └── import-csv.ts→ parser, validação, template              │
├──────────────────────────────────────────────────────────────┤
│  Prisma 7 (SQLite)                                           │
│  Organization, Building, Unit, Resident, Package,            │
│  PackageEvent, Operator                                      │
└──────────────────────────────────────────────────────────────┘
```

## Modelo de dados (núcleo)

- **Organization** — condomínio.
- **Building** — bloco/torre (`@@unique([organizationId, label])`).
- **Unit** — apartamento (`@@unique([buildingId, number])`).
- **Resident** — morador vinculado a uma `Unit`; `isPrimary` distingue titular.
- **Package** — encomenda; status enum: `PENDING | NOTIFIED | PICKED_UP | CANCELLED`. Campos chave: `receivedAt`, `notifiedAt`, `pickedUpAt`, `pickedUpByName`, `pickedUpByDocument`, `labelPhotoUrl`.
- **PackageEvent** — trilha de auditoria: `PACKAGE_RECEIVED`, `PACKAGE_NOTIFIED`, `PACKAGE_PICKED_UP`, `PACKAGE_UPDATED`, `PACKAGE_CANCELLED`.
- **Operator** — usuários internos (`ADMIN | FRONT_DESK | MANAGER`).

> **Decisão**: `OVERDUE` é um *estado derivado* (24h desde `receivedAt` com status `PENDING` ou `NOTIFIED`). Não virou coluna nem enum para evitar drift entre regra de negócio e dados persistidos.

## Fluxos críticos

### 1. Entrada da encomenda (`/mobile/intake`)
1. Foto da etiqueta (`/api/upload/label` grava em `public/uploads/...jpg`).
2. OCR opcional (tesseract.js carregado dinamicamente) extrai código, transportadora, apto.
3. Autocomplete de morador (`/api/residents/search?q=...`).
4. `POST /api/packages` cria Package + PackageEvent (`PACKAGE_RECEIVED`) em transação.
5. Resposta retorna `whatsappUrl` (wa.me) para a portaria abrir.

### 2. Notificação (`/api/packages/[id]/notify`)
- Server action `markNotified` muda status para `NOTIFIED`, grava `notifiedAt` e cria `PACKAGE_NOTIFIED`.
- O link `wa.me` é uma **ação manual do porteiro**; o app apenas monta a URL e a mensagem.

### 3. Retirada (`/mobile/package/[id]`)
- Form exige `pickedUpByName` (≥2 chars) e aceita documento/observação.
- Status → `PICKED_UP`, `pickedUpAt = now()`, evento `PACKAGE_PICKED_UP`.

### 4. Atraso (>24h)
- `isPackageOverdue(pkg)` + `overdueThresholdDate()` padronizam o cálculo.
- Lista mobile e dashboard admin destacam visualmente.

## Storage híbrido (preparado, não ativo no MVP)

- `src/lib/storage.ts` já isola a escrita entre `public/uploads` (default) e Supabase Storage (opt-in por env). O MVP usa o caminho local.
- A escolha por local evita custo fixo, latência de upload na portaria e dependência de chaves para o primeiro piloto.

## Decisões deliberadamente adiadas

- **PWA manifest / service worker**: estrutura já permite, mas não é gerado no MVP para não esconder complexidade.
- **Sync multi-dispositivo**: exigiria backend; não cabe no MVP offline-first.
- **OCR na nuvem (Google Vision, etc.)**: substituído por heurística local + tesseract.js quando disponível.
- **WhatsApp Cloud API**: o MVP usa `wa.me` manual; integração fica em fase posterior.
