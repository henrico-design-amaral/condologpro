# HANDOFF — CondoLogPro

## Último estado conhecido

Branch atual: `infra/supabase-vercel-camera-mvp`.

O projeto agora possui app Next.js funcional com:

- Prisma/SQLite local;
- schema Supabase/PostgreSQL separado;
- seed com condomínio demo, blocos, unidades, moradores, encomendas e eventos;
- telefones seeded de moradores como `+55 11 953970704`;
- fluxo `/mobile/intake` com câmera direta, captura por arquivo, OCR experimental e autocomplete;
- upload de etiqueta local ou Supabase Storage conforme variáveis;
- `/mobile/pending` com lista real;
- `/mobile/package/[id]` com baixa de retirada;
- `/admin`, `/admin/packages` e `/admin/residents` conectados ao banco;
- documentação Supabase/Vercel e câmera.

## Contexto essencial

CondoLogPro é um MVP para logística de encomendas, não um app genérico de condomínio.

O fluxo real de referência continua:

1. Portaria/administração recebe encomenda.
2. Operador fotografa etiqueta.
3. Operador confirma morador/unidade.
4. Sistema registra encomenda.
5. Sistema gera WhatsApp assistido.
6. Encomenda aparece em pendentes.
7. Operador baixa retirada.
8. Admin consulta registros e histórico.

## O que depende do usuário

- Criar ou confirmar repositório GitHub remoto.
- Criar projeto Supabase.
- Criar bucket `package-labels`.
- Configurar variáveis reais no Supabase/Vercel.
- Rodar comandos cloud documentados em `docs/implementation/SUPABASE_VERCEL_SETUP.md`.

## Atenção

- Não há credenciais Supabase reais neste ambiente.
- Não afirmar validação cloud antes de testar com `DATABASE_URL`, `DIRECT_URL` e bucket reais.
- Manter fallback local e manual.
- Não adicionar billing, WhatsApp Cloud API ou módulos genéricos antes do fluxo de encomendas estar validado.
