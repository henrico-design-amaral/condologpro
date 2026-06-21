# CondoLogPro - Especificacao tecnica da Fase 2

Status: proposta pronta para implementacao, ainda nao executada.

## 1. Objetivo

Tornar o fluxo Sellable MVP demonstravel em um ambiente preview isolado, com identidade de operador, autorizacao server-side, banco PostgreSQL versionado, fotos privadas e rollback documentado. A Fase 2 nao transforma o produto em SaaS multi-condominio completo.

## 2. Evidencia atual

- Next.js App Router, TypeScript, Prisma, SQLite local e schema PostgreSQL/Supabase existem.
- O adaptador de Storage alterna entre filesystem local e Supabase conforme variaveis de ambiente.
- O schema possui `Operator`, mas nao possui vinculo com uma identidade autenticada.
- Nao ha biblioteca, rota, sessao ou guard de autenticacao no codigo atual.
- Nao ha migrations versionadas; os scripts cloud usam `prisma db push`.
- A CI valida somente o caminho SQLite e nao valida migrations PostgreSQL.
- Supabase real, Storage real, preview Vercel e camera em celular fisico ainda nao foram comprovados. Não consigo confirmar isso.

## 3. Fora de escopo

- Cadastro publico, autoatendimento ou login de morador.
- SSO, login social, MFA e recuperacao customizada.
- Multi-condominio comercial, billing ou planos.
- WhatsApp Cloud API.
- OCR obrigatorio ou servico externo de OCR.
- PWA, service worker ou app nativo.
- Alteracao visual sem necessidade direta de autenticacao ou estado de erro.

## 4. Autenticacao minima aceitavel

### Provedor

Usar Supabase Auth com email e senha, somente por convite administrativo. Cadastro publico deve permanecer desabilitado no piloto.

### Identidade operacional

- Adicionar `authSubject` unico e obrigatorio a `Operator` no schema cloud.
- O valor corresponde ao identificador imutavel do usuario no Supabase Auth.
- Nao criar foreign key entre Prisma e o schema interno de Auth do Supabase.
- Operadores inativos devem perder acesso mesmo com sessao Auth valida.
- O `organizationId` sempre vem do `Operator` encontrado no servidor, nunca do cliente.

### Sessao e autorizacao

- Sessao mantida em cookie seguro, `HttpOnly`, `SameSite=Lax` e `Secure` fora do localhost.
- Toda pagina protegida e toda API deve validar a sessao no servidor.
- Redirecionamento de interface nao substitui autorizacao na API.
- Toda query Prisma deve aplicar o `organizationId` do operador autenticado.
- Ausencia de operador, operador inativo ou papel insuficiente retorna acesso negado sem revelar dados.

### Matriz minima de acesso

| Superficie | FRONT_DESK | ADMIN | MANAGER |
| --- | --- | --- | --- |
| `/mobile/*` | usar | usar | usar |
| Buscar morador | usar | usar | usar |
| Criar, avisar e baixar pacote | usar | usar | usar |
| `/admin`, pacotes e historico | sem acesso | usar | usar |
| Importar moradores | sem acesso | usar | usar |
| Configuracoes | sem acesso | usar | usar |
| Criar/desativar operador | sem acesso | usar | sem acesso |

## 5. Protecao de dados e fotos

- Bucket `package-labels` privado em preview e producao.
- Upload permitido apenas por endpoint server-side autenticado.
- `SUPABASE_SERVICE_ROLE_KEY` permanece exclusivamente no servidor.
- Nome do objeto deve usar organizacao, data e identificador aleatorio; nao incluir morador, telefone, unidade ou codigo legivel.
- Validar MIME real, extensao permitida e limite de tamanho antes do upload.
- Persistir somente o caminho do objeto, nao uma URL assinada temporaria.
- Entregar foto por endpoint autenticado que gere URL assinada de curta duracao.
- Nao registrar telefone, documento, URL assinada ou conteudo OCR em logs de erro.
- Definir retencao do piloto e procedimento de exclusao antes de usar dados reais.
- Dados do preview devem ser sinteticos.

## 6. Banco e migrations

### Fonte de verdade

- PostgreSQL/Supabase e a fonte de verdade do ambiente cloud.
- `prisma/schema.supabase.prisma` continua sendo o schema cloud nesta fase.
- `prisma/migrations/` fica reservado para migrations PostgreSQL.
- SQLite local continua usando `prisma db push`; nao deve executar as migrations PostgreSQL.
- Adicionar validacao automatica de paridade conceitual entre os dois schemas enquanto o fallback SQLite existir.

### Comandos exigidos na implementacao

- `prisma migrate dev --schema prisma/schema.supabase.prisma` somente contra banco local/preview descartavel.
- `prisma migrate status --schema prisma/schema.supabase.prisma` como gate.
- `prisma migrate deploy --schema prisma/schema.supabase.prisma` para aplicar migrations versionadas.
- `prisma db push` fica proibido em preview compartilhado e producao.

### Primeira migration

A migration inicial deve representar o schema PostgreSQL atual e adicionar o vinculo `Operator.authSubject`. Antes de aplica-la, validar se o banco alvo esta vazio ou reconciliar baseline explicitamente. Nao marcar migration como aplicada sem comparar o schema real.

## 7. Estrategia de rollback

- Usar migrations pequenas e backward-compatible no modelo expand-contract.
- Criar backup ou confirmar Point-in-Time Recovery antes da migration.
- Aplicar e testar primeiro no projeto Supabase de preview.
- Build da aplicacao nunca executa migration automaticamente.
- Falha de migration bloqueia o deploy da aplicacao.
- Falha apenas da aplicacao permite rollback do deployment Vercel para o commit anterior.
- Prisma nao fornece down migration automatica; mudanca destrutiva exige SQL reverso revisado ou restauracao do backup.
- Remocao de coluna ou tabela fica fora desta fase.

## 8. Ambientes e variaveis

| Variavel | Local fallback | Preview | Producao |
| --- | --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | pooler do Supabase preview | pooler de producao |
| `DIRECT_URL` | ausente | conexao direta preview | conexao direta producao |
| `NEXT_PUBLIC_SUPABASE_URL` | ausente | URL preview | URL producao |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ausente | anon preview | anon producao |
| `SUPABASE_SERVICE_ROLE_KEY` | ausente | secret server-side | secret server-side |
| `SUPABASE_STORAGE_BUCKET` | ausente | bucket privado preview | bucket privado producao |

Regras:

- Preview e producao usam projetos Supabase diferentes.
- Variaveis de preview nao podem apontar para producao.
- Nenhum valor real entra em `.env.example`, Git, logs ou screenshots.
- Variaveis `NEXT_PUBLIC_*` sao publicas por definicao; nenhuma chave privilegiada pode usar esse prefixo.
- Rotacao de segredo exige novo deploy e revogacao do valor anterior.

## 9. Preview Vercel

1. Conectar uma branch tecnica da Fase 2 a um preview, nao a producao.
2. Configurar somente variaveis do Supabase de preview.
3. Aplicar migrations por etapa controlada antes do smoke test; nunca no `buildCommand`.
4. Criar operadores de teste por convite e vincula-los ao seed sintetico.
5. Proteger o preview contra acesso anonimo alem da tela de login.
6. Registrar URL, commit, migration aplicada e projeto Supabase usado.
7. Executar smoke test completo antes de qualquer promocao.

## 10. QA em celular fisico

Executar em pelo menos um Android/Chrome e um iPhone/Safari quando disponivel, sempre por HTTPS.

Validar:

- login, renovacao e expiracao da sessao;
- bloqueio de rota sem sessao;
- permissao negada para papel incorreto;
- abertura e troca entre camera traseira e fallback de arquivo;
- captura, retake, upload e visualizacao autenticada da foto;
- busca de morador e criacao do pacote;
- aviso assistido, pendentes e retirada;
- perda e retomada de rede sem duplicar pacote;
- ausencia de telefone, documento ou signed URL no console e nos logs.

## 11. Fallback obrigatorio

- Se `getUserMedia` nao existir, for negado ou estiver em contexto inseguro, oferecer imediatamente o input de arquivo com captura de ambiente.
- Se OCR falhar, demorar ou retornar baixa confianca, manter a foto e liberar preenchimento manual de codigo e transportadora.
- OCR nunca seleciona morador nem salva pacote sem confirmacao humana.
- Se upload falhar, preservar formulario e arquivo em memoria para retry; nao criar registro apontando para foto inexistente.
- Se WhatsApp nao abrir, o pacote permanece salvo e o aviso pode ser refeito manualmente.
- Repeticao por timeout deve usar protecao contra criacao duplicada.

## 12. Ordem de implementacao

1. Congelar baseline visual e testes do fluxo atual.
2. Criar projeto Supabase de preview, bucket privado e matriz de envs.
3. Versionar baseline PostgreSQL e migration de identidade do operador.
4. Implementar sessao, lookup de operador e autorizacao server-side.
5. Aplicar escopo por organizacao a paginas, APIs e queries.
6. Fechar upload privado e entrega por URL assinada autenticada.
7. Adicionar gates de migration, auth e seguranca a CI/preview.
8. Executar QA desktop e celular fisico, incluindo todos os fallbacks.
9. Documentar backup, rollback e evidencia do preview.

## 13. Criterios de aceite da Fase 2

- Usuario anonimo nao acessa rotas nem APIs operacionais.
- FRONT_DESK nao acessa funcoes administrativas.
- Toda leitura e escrita usa a organizacao do operador autenticado.
- Operador inativo perde acesso.
- Nenhuma foto e publica e signed URLs expiram.
- Nenhuma service role aparece no cliente, log ou bundle.
- Migrations PostgreSQL estao versionadas e `migrate status` passa.
- Backup/restore ou PITR e rollback da aplicacao foram ensaiados em preview.
- Preview usa Supabase isolado e dados sinteticos.
- Fluxo entrada -> aviso -> pendente -> retirada -> historico passa em celular fisico via HTTPS.
- Camera e OCR podem falhar sem bloquear o registro manual.
- Checklist `condologpro-sellable-mvp.json` termina em `PASS` com evidencias.

Sem evidencia de cada item, a Fase 2 nao esta concluida.
