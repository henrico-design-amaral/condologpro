# Pilot QA Checklist — CondoLogPro

## Objetivo

Validar se o MVP pode ser usado em teste real controlado no condomínio.

## Antes do teste

- [ ] App roda localmente.
- [ ] Celular acessa /mobile na mesma rede.
- [ ] Banco tem seed.
- [ ] Existe pelo menos 1 bloco.
- [ ] Existem apartamentos cadastrados.
- [ ] Existem moradores com telefone.
- [ ] Upload de foto funciona.
- [ ] WhatsApp abre com mensagem pronta.
- [ ] Admin desktop abre.

## Fluxo de entrada

- [ ] Operador abre /mobile.
- [ ] Toca em Nova encomenda.
- [ ] Fotografa ou anexa etiqueta.
- [ ] Seleciona bloco.
- [ ] Seleciona apartamento.
- [ ] Seleciona morador.
- [ ] Cria pacote.
- [ ] Sistema salva como pendente/notificado.
- [ ] Sistema mostra botão WhatsApp.
- [ ] WhatsApp abre com mensagem correta.

## Fluxo de retirada

- [ ] Operador abre lista de pendentes.
- [ ] Localiza pacote por bloco/apto/morador.
- [ ] Abre detalhe.
- [ ] Preenche nome de quem retirou.
- [ ] Confirma retirada.
- [ ] Sistema atualiza status.
- [ ] Histórico registra evento.

## Admin desktop

- [ ] Admin vê resumo.
- [ ] Admin vê tabela de pacotes.
- [ ] Admin filtra por pendentes.
- [ ] Admin consulta retirados.
- [ ] Admin vê moradores.
- [ ] Admin edita morador.

## Falhas aceitáveis no MVP

- OCR não reconhecer etiqueta.
- Importação aceitar apenas CSV inicialmente.
- Sem login robusto.
- Sem envio automático real de WhatsApp.

## Falhas bloqueantes

- Perder pacote registrado.
- Não salvar foto.
- Não gerar WhatsApp.
- Não baixar retirada.
- Não funcionar no celular.
- Não persistir dados após reiniciar app.
