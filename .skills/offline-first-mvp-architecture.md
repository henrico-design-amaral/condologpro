# offline-first-mvp-architecture

## Quando usar

Antes de qualquer decisão técnica do MVP, sempre que surgir tentação de cloud, fila assíncrona, multi-tenant real, billing ou autenticação complexa.

## Princípios

1. Banco local em SQLite (`prisma/dev.db`).
2. Prisma como ORM com schema único `prisma/schema.prisma`.
3. Next.js App Router com API routes locais.
4. Upload local em `public/uploads`.
5. WhatsApp via link assistido `wa.me`, nunca Cloud API no MVP.
6. OCR opcional via `tesseract.js`, com fallback manual obrigatório.
7. Acesso na rede local do condomínio: `npm run dev:host` permite IP da máquina + porta 3000.
8. Sem autenticação complexa: contexto local controlado pelo síndico.
9. Sem multi-tenant: organização única seedada como `Condomínio Demo CondoLogPro`.

## Restrições ativas

- Não usar Railway.
- Não usar Postgres remoto no MVP.
- Não criar billing.
- Não criar autenticação complexa.
- Não depender de API externa para fluxo principal.

## Sinais de violação

- Dependência de variável de ambiente cloud para fluxo principal.
- API route que falha sem internet.
- Componente que assume token de terceiros.
- Componente que assume webhook externo.

## Fallback obrigatório

- Câmera direta (getUserMedia) com fallback para `<input type="file" capture="environment">`.
- OCR com fallback manual.
- WhatsApp com fallback de cópia de mensagem manual.
- Upload com fallback local sempre disponível.

## Saída

Confirmar que `docs/OFFLINE_FIRST_ARCHITECTURE.md` reflete o estado real do código.
