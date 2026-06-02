# Cloud-Ready Architecture (with Local Fallback)

## Princípios

1. **Cloud é o alvo.** O deploy padrão é Vercel + Supabase Postgres + Supabase Storage. O código de aplicação é o mesmo nos dois modos.
2. **Local é o fallback.** Desenvolvimento, pilotos offline e contingência rodam em SQLite + `public/uploads` sem dependência de serviços externos.
3. **Nenhuma dependência externa bloqueia o caminho feliz.** OCR, upload e busca de morador funcionam localmente; cloud só é consultado quando há credenciais reais.
4. **Reconciliação é optativa.** Tudo o que tocar rede (Supabase Storage signed URL, WhatsApp Cloud) é um *enhancement* plugado depois, nunca um pré-requisito.

## Decisão de modo

O modo é decidido por **variáveis de ambiente** no deploy:

| Variável | Ausente | Presente (valor típico) |
| --- | --- | --- |
| `DATABASE_URL` | — | `postgresql://…pooler…/postgres?pgbouncer=true` (cloud) ou `file:./dev.db` (local) |
| `DIRECT_URL` | — | `postgresql://…/postgres` (apenas cloud) |
| `NEXT_PUBLIC_SUPABASE_URL` | — | `https://[project-ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | — | chave anon (apenas cloud) |
| `SUPABASE_SERVICE_ROLE_KEY` | — | service role (server-side apenas) |
| `SUPABASE_STORAGE_BUCKET` | — | `package-labels` |
| `SUPABASE_STORAGE_PUBLIC` | comportamento padrão (público) | `true` força público; `false` força privado (signed URLs) |

> **Sem credenciais Supabase**: o app usa SQLite (precisa de `schema.prisma` como default) e grava fotos em `public/uploads`.
> **Com credenciais Supabase**: o app usa Postgres e Supabase Storage. O helper `src/lib/storage.ts` detecta as variáveis e escolhe o caminho.

## Camadas

```
┌──────────────────────────────────────────────────────────────┐
│  UI (Next.js App Router, RSC + Client)                       │
│  ├── /mobile/*  → fluxo do porteiro (dark, mobile-first)     │
│  └── /admin/*   → fluxo do síndico (light, denso)            │
├──────────────────────────────────────────────────────────────┤
│  Server actions / Route Handlers                             │
│  ├── /api/packages, /api/residents/search                    │
│  ├── /api/packages/[id]/{notify,pickup}                      │
│  ├── /api/upload/label → Supabase Storage OU public/uploads  │
│  └── /api/import/residents → CSV preview + commit            │
├──────────────────────────────────────────────────────────────┤
│  Domain libs                                                 │
│  ├── stats.ts     → métricas, OVERDUE_THRESHOLD_HOURS = 24   │
│  ├── format.ts    → datas, horas relativas, números          │
│  ├── whatsapp.ts  → montagem de wa.me + mensagens prontas    │
│  ├── storage.ts   → local + Supabase (public + signed URL)   │
│  └── import-csv.ts→ parser, validação, template              │
├──────────────────────────────────────────────────────────────┤
│  Prisma                                                       │
│  ├── schema.prisma            (SQLite — local default)       │
│  └── schema.supabase.prisma   (PostgreSQL — cloud)           │
│  Modelos: Organization, Building, Unit, Resident, Package,   │
│  PackageEvent, Operator                                       │
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
1. Foto da etiqueta — `src/lib/storage.ts` decide entre Supabase Storage e `public/uploads`.
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

## Storage: local vs Supabase

`src/lib/storage.ts` é o ponto único de decisão:

```ts
// detecta config do Supabase Storage
const config = getSupabaseStorageConfig();

// se ausente → grava em public/uploads
// se presente → upload via REST /storage/v1/object/{bucket}/{path}
```

- **Bucket público** (`SUPABASE_STORAGE_PUBLIC=true` ou default): retorna URL pública `/storage/v1/object/public/{bucket}/{path}`. Ideal para fotos que precisam aparecer direto na UI.
- **Bucket privado** (`SUPABASE_STORAGE_PUBLIC=false`): use `createSignedLabelUrl(path, ttl)` server-side para gerar URL temporária (default 10 min). A UI nunca recebe a service role key.
- **Validação** (sempre): jpeg/png/webp, ≤ 8 MB, path `labels/YYYY-MM-DD/{uuid}.{ext}`.

> **Limitação conhecida**: a UI atual consome a URL pública retornada por `storeLabelPhoto`. Para bucket privado, é preciso passar a URL por um endpoint de leitura (`/api/upload/label/[...path]`) que chama `createSignedLabelUrl`. Está documentado em `docs/implementation/CLOUD_READY_FOUNDATION.md`.

## CI (GitHub Actions)

- Dispara em push e PR para `main` e `mvp/**`.
- Roda `prisma:validate`, `prisma:generate`, `typecheck`, `build` contra SQLite (sem credenciais Supabase).
- Cloud validation contra Supabase real **permanece manual** até que secrets sejam configurados em GitHub.

## Decisões deliberadamente adiadas

- **PWA manifest / service worker**: estrutura já permite; fica para próxima iteração.
- **Multi-tenant SaaS completo**: o schema suporta, mas a UI opera em um condomínio por vez.
- **OCR na nuvem (Google Vision, etc.)**: substituído por heurística local + tesseract.js quando disponível.
- **WhatsApp Cloud API**: o MVP usa `wa.me` manual; integração fica em fase posterior.
- **Migrations versionadas**: enquanto o MVP evolui rápido, `prisma db push` é aceitável. Migrar para `prisma migrate dev` quando a estrutura estabilizar.
