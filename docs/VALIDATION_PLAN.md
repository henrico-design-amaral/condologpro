# Validation Plan

> Plano de validação para garantir que o MVP está íntegro antes de qualquer commit de fechamento ou piloto.

## 1. Validação estática (CI-ready)

| Comando | Esperado | Por quê |
| --- | --- | --- |
| `npm run prisma:validate` | exit 0, sem mensagens de erro | Garante que `schema.prisma` e `schema.supabase.prisma` continuam válidos. |
| `npm run typecheck` | exit 0, sem erros TS | Pega regressões de tipo em todo o repositório. |
| `npm run build` | 16/16 páginas estáticas geradas, sem warnings novos | Confirma que rotas, RSC e client components compilam. |
| `npm run db:push` | Aplica schema em `prisma/dev.db` | Confirma que o banco local está sincronizado. |
| `npm run db:seed` | `{ buildings: 5, units: 50, residents: 120, packages: 32, ... }` | Garante volume mínimo de teste. |

> Os scripts `db:validate`, `db:generate`, `db:push`, `db:seed`, `db:reset` estão registrados em `package.json` para evitar parâmetros longos.

## 2. Validação manual por fluxo

### 2.1 Entrada de encomenda
1. Acessar `/mobile/intake` (HTTPS ou localhost).
2. Tirar foto ou fazer upload de uma etiqueta de teste.
3. Rodar OCR; verificar que "Código" e "Transportadora" entram como sugestão.
4. Buscar morador por nome (debounce ~220 ms). Selecionar.
5. Submeter. **Esperado**: tela de sucesso com botão "Enviar WhatsApp" (se houver telefone).
6. Conferir em `/admin/packages` e em `/mobile/pending` que a encomenda aparece com `PENDING`.

### 2.2 Aviso
1. Em `/mobile/package/[id]`, clicar em "Abrir WhatsApp" (abre `wa.me`).
2. Voltar ao app e clicar em "Marcar como avisado".
3. **Esperado**: status muda para `NOTIFIED`, evento `PACKAGE_NOTIFIED` aparece no histórico, `notifiedAt` preenchido.

### 2.3 Retirada
1. Em `/mobile/package/[id]`, preencher nome (≥ 2 chars), documento (opcional), observação (opcional).
2. Clicar em "Baixar retirada".
3. **Esperado**: status `PICKED_UP`, `pickedUpAt` preenchido, redireciona para `/mobile/pending` e o item sai da lista.

### 2.4 Atraso
1. Verificar seed: 3 pacotes `PENDING` com `receivedAt` > 24 h.
2. Em `/mobile/pending?overdue=1`, devem aparecer destacados com borda rosa e badge `OVERDUE`.
3. No `/admin` (painel), KPI "Atrasadas" deve refletir a contagem.

### 2.5 Importação de moradores
1. Baixar template em `/admin/import`.
2. Submeter CSV válido (preview).
3. Conferir preview: linhas válidas × inválidas, cabeçalhos faltantes.
4. Commitar. **Esperado**: `created: { buildings, units, residents }` cresce; `skipped` conta duplicatas.

### 2.6 Histórico
1. Em `/admin/history`, aplicar filtros (bloco, status, período).
2. **Esperado**: lista filtrada; clicar expande a timeline de eventos do pacote.

## 3. Critérios de aceite do piloto

- [ ] Todos os comandos da seção 1 passam localmente.
- [ ] Os 6 fluxos manuais (2.1 a 2.6) foram executados sem erro.
- [ ] Pelo menos 1 teste foi feito em **celular real** via rede local (HTTPS) — câmera, autocomplete, e download de retirada.
- [ ] Logs do servidor não expõem PII (telefones) em URLs de erro.
- [ ] Commit final usa Conventional Commits e working tree limpa (`git status` exibe nada).
