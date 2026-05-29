# CondoLogPro

Sistema local-first para gestão de encomendas condominiais.

## Objetivo

Criar um MVP funcional para teste real em condomínio, com foco inicial no fluxo operacional da portaria:

1. Portaria/administração recebe pacote.
2. Fotografa a etiqueta.
3. Sistema cria entrada da encomenda.
4. Sistema associa a unidade, bloco, apartamento e morador.
5. Sistema gera mensagem de WhatsApp para avisar o morador.
6. Na retirada, a portaria baixa o pacote com registro digital.

## Contexto real de uso

O projeto nasce a partir de um fluxo manual observado em condomínio residencial de grande porte, onde a administração recebe encomendas, registra dados em caderno físico, envia aviso manual por WhatsApp e coleta assinatura no momento da retirada.

## Primeira versão

A primeira versão deve ser local-first e funcionar como protótipo operacional dentro do condomínio.

- Portaria: uso mobile.
- Administração: uso desktop.
- Banco local: SQLite.
- Upload de fotos: armazenamento local.
- WhatsApp: envio assistido via link/mensagem pronta.
- OCR: desejável, mas sempre com fallback manual.

## Princípio central

Não mudar a rotina da portaria. Digitalizar o que já funciona manualmente.
