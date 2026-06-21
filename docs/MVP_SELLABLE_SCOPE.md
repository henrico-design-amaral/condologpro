# CondoLogPro - Escopo congelado do MVP vendavel

Data do congelamento: 2026-06-21
Branch de fundacao: `feature/sellable-mvp-foundation`

## Verdade operacional

O nucleo esta implementado e compila, mas ainda nao esta pronto para venda ou piloto real. Faltam QA manual completo, teste de camera em aparelho fisico, validacao com infraestrutura cloud real e uma decisao explicita sobre autenticacao. Não consigo confirmar isso.

## Problema real

Portarias registram entrada, aviso e retirada de encomendas em caderno, planilha e WhatsApp manual. Isso aumenta digitacao, dificulta localizar pendencias e enfraquece a trilha de auditoria.

## Publico-alvo

- Primario: porteiros e administradores que recebem encomendas em celular.
- Secundario: administracao e sindico que consultam pendencias, volume e historico em desktop.
- Morador e destinatario indireto; nao tera login nesta sprint.

## Promessa comercial do MVP

Registrar uma encomenda com foto, associar o morador, abrir o aviso assistido no WhatsApp e comprovar a retirada em um unico fluxo auditavel. O produto nao promete OCR infalivel, envio automatico ou operacao offline completa.

## Fluxo principal vendavel

1. Administracao importa uma base CSV de moradores ou usa a base demo.
2. Portaria abre `/mobile/intake`.
3. Operador fotografa ou anexa a etiqueta.
4. OCR sugere dados quando possivel; o operador confirma manualmente.
5. Operador busca e seleciona morador/unidade.
6. Sistema salva a encomenda e sua evidencia visual.
7. Operador abre a mensagem pronta via `wa.me` e marca o aviso.
8. Encomenda aparece em `/mobile/pending`.
9. Na retirada, operador informa quem retirou e confirma a baixa.
10. Administracao consulta pacote, status, eventos e KPIs.

## Telas obrigatorias

- `/mobile`: entrada operacional.
- `/mobile/intake`: foto/upload, sugestao OCR, morador e criacao.
- `/mobile/pending`: busca e pendencias, inclusive atrasadas.
- `/mobile/package/[id]`: detalhe, aviso e retirada.
- `/admin`: KPIs operacionais.
- `/admin/packages`: consulta de encomendas.
- `/admin/history`: trilha de eventos.
- `/admin/residents`: consulta da base.
- `/admin/import`: preview e importacao CSV.
- `/admin/settings`: leitura do modo operacional e armazenamento.

## Entidades essenciais de banco

- `Organization`: condominio do piloto.
- `Building`: bloco ou torre.
- `Unit`: apartamento ou unidade.
- `Resident`: morador e telefone.
- `Operator`: responsavel operacional; existe no schema, mas autenticacao e atribuicao real nao estao implementadas.
- `Package`: encomenda, evidencia, status e timestamps.
- `PackageEvent`: trilha de recebimento, aviso, atualizacao e retirada.

SQLite e PostgreSQL/Supabase possuem schemas equivalentes. Nao ha migrations versionadas. O modo cloud real depende de credenciais e recursos externos ainda nao validados.

## O que esta comprovado localmente

- Schemas Prisma SQLite e PostgreSQL validos.
- SQLite sincronizado e seed deterministico criado: 5 blocos, 50 unidades, 120 moradores, 32 encomendas e 65 eventos.
- Typecheck e build Next.js passam.
- Parser de etiqueta passa nos testes existentes.
- Rotas mobile, admin e API compilam.
- Upload local e adaptador Supabase existem no codigo.
- Camera, OCR Tesseract e fallback por arquivo existem no codigo.
- WhatsApp assistido usa link `wa.me`; nao usa API oficial.

## Parcial, quebrado ou nao confirmado

- QA manual dos seis fluxos: pendente. Não consigo confirmar isso.
- Camera em celular real via HTTPS: pendente. Não consigo confirmar isso.
- Precisao do OCR em etiquetas reais: nao medida. Não consigo confirmar isso.
- Supabase Postgres e Storage reais: sem validacao. Não consigo confirmar isso.
- Deploy Vercel atual e estado de producao: nao verificados nesta fase. Não consigo confirmar isso.
- Autenticacao, sessao e autorizacao: nao encontradas no codigo.
- Identidade real do operador nos eventos: nao comprovada.
- Persistencia de filesystem local na Vercel: nao e uma estrategia valida de producao; cloud exige Storage configurado.
- Migrations versionadas e rollback de banco: ausentes.

## Criterios de aceite da sprint vendavel

- Todos os comandos locais do gate passam sem mudanca funcional nao revisada.
- Fluxo completo entrada -> aviso -> pendente -> retirada -> historico passa manualmente.
- Entrada e concluida em ate 30 segundos com OCR desligado ou falhando.
- Camera e fallback de arquivo passam em um celular fisico via HTTPS.
- Busca retorna o morador correto sem expor dados de outro condominio.
- Falha de OCR nunca impede digitacao e salvamento manual.
- Falha de WhatsApp nunca perde o registro da encomenda.
- Cada mudanca de status gera evento auditavel.
- Fotos usam Storage persistente no ambiente demonstrado.
- Banco do ambiente demonstrado e conhecido, isolado e restauravel.
- Nenhuma chave server-side chega ao cliente ou ao Git.
- Estado vazio, loading, erro e sucesso foram revisados visualmente em mobile e desktop.
- Nao existe regressao visual contra as capturas aprovadas na abertura da Fase 2.

## Fora de escopo desta sprint

- WhatsApp Cloud API ou envio automatico.
- OCR externo, obrigatorio ou sem confirmacao humana.
- Billing, assinatura ou cobranca.
- Multi-condominio de producao.
- Login de morador.
- Modulos de manutencao, reservas, comunicados ou reclamacoes.
- App nativo, lockers, BI avancado e assinatura juridica.
- XLSX, PWA e service worker.

## Riscos

- Critico: ausencia de autenticacao torna um deploy publico inadequado para dados reais.
- Critico: cloud nao foi validada; a demonstracao nao pode depender de credenciais improvisadas.
- Alto: nao ha migrations versionadas nem procedimento comprovado de rollback.
- Alto: camera e OCR variam por aparelho, luz, permissao e HTTPS.
- Alto: dados de moradores e fotos sao dados pessoais; piloto exige minimizacao, acesso controlado e descarte definido.
- Medio: documentacao de branch e estado esta defasada em relacao ao Git.
- Medio: configuracao Prisma em `package.json` ja emite aviso de deprecacao para Prisma 7.

## Checklist de demonstracao

- [ ] Usar ambiente de demonstracao isolado, sem dados pessoais reais.
- [ ] Confirmar banco e Storage ativos antes de abrir a interface.
- [ ] Confirmar celular com HTTPS, camera permitida e fallback de arquivo.
- [ ] Importar CSV demo e mostrar preview antes do commit.
- [ ] Registrar pacote com OCR e corrigir sugestao manualmente.
- [ ] Abrir WhatsApp assistido sem afirmar que a mensagem foi enviada automaticamente.
- [ ] Marcar aviso e mostrar evento.
- [ ] Localizar pacote em pendentes.
- [ ] Baixar retirada e mostrar saida da lista.
- [ ] Abrir historico e KPIs no desktop.
- [ ] Repetir o fluxo com OCR indisponivel.
- [ ] Encerrar sem deixar dados ou fotos reais no ambiente demo.

## Quando pode ser chamado de vendavel

O MVP e vendavel quando um comprador consegue ver o fluxo completo sem intervencao tecnica, o operador consegue executa-lo em celular real, o admin recupera a trilha no desktop, o ambiente persiste os dados com acesso controlado e todas as limitacoes comerciais estao declaradas. Build verde sozinho nao atende esse criterio.
