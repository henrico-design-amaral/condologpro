# whatsapp-assisted-notification

## Quando usar

Ao revisar ou corrigir o envio de notificação ao morador no MVP.

## Princípios

- Sem WhatsApp Cloud API.
- Sem WhatsApp Web automação.
- Envio sempre assistido via `wa.me`.
- Mensagem deve ser pronta para envio, sem digitação adicional.

## Formato da mensagem

```
Olá, [NOME].

Sua encomenda chegou na portaria do [CONDOMÍNIO].

Bloco: [BLOCO]
Apartamento: [APTO]
Data/Hora: [DATA]

Por favor, retire na administração/portaria quando possível.
```

## Construção do link

- Normalizar telefone removendo não-dígitos.
- Garantir prefixo "55" (Brasil) sem duplicar.
- URL final: `https://wa.me/{55XXXXXXXXXXX}?text={mensagem encodada}`.

## Comportamento

- Botão "Enviar WhatsApp" deve abrir nova aba.
- Ao clicar, registrar evento `PACKAGE_NOTIFIED` no histórico e marcar `notifiedAt`.
- Sem telefone cadastrado: mostrar bloco amarelo orientando aviso manual.

## Falhas previstas

- Telefone inválido: ainda gera link, mas avisa que pode falhar.
- Falha de rede no `notify`: tolerar e seguir, sem bloquear o fluxo visual.

## Saída

Fluxo no `/mobile/intake` e no `/mobile/package/[id]` respeitam as mesmas regras.
