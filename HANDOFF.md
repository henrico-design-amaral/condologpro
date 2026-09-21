# HANDOFF — CondoLogOPS Marketing

## Estado em 2026-09-21

O marketing está separado do app e opera em Astro estático. A identidade pública foi consolidada como **CondoLogOPS** e o Visual Lock está `READY`.

O lote atual removeu resíduos técnicos que pertenciam ao antigo runtime operacional:

- configurações Next.js;
- schemas/seed Prisma;
- componentes React operacionais;
- helpers `src/lib/**`.

A remoção só ocorreu após confirmar que o `package.json` ativo contém apenas Astro e que as páginas Astro não importam esses caminhos.

## Autoridades

- marketing: este repositório;
- runtime/data/auth: `henrico-design-amaral/condologpro-app`;
- visual: `VISUAL_LOCK.json` + Style/Design docs;
- nome semântico: `CondoLogOPS`.

## Limites

O app ainda não possui preview HTTPS autenticado validado. O Supabase legado restaurado não corresponde ao ledger atual do app. Portanto a landing não deve declarar disponibilidade operacional de produção.
