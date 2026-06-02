# mobile-camera-intake-flow

## Quando usar

Ao desenhar, revisar ou corrigir o fluxo `/mobile/intake`.

## Princípios

- Câmera deve estar a um toque do operador.
- Captura por arquivo com `capture="environment"` é fallback de primeira linha, não plano B obscuro.
- A prévia da foto deve ser grande, em aspecto 4/3, sem corte excessivo.
- OCR roda sob demanda, nunca automaticamente após captura.
- Sugestões OCR aparecem como botões editáveis, sem sobrescrever campos preenchidos manualmente.
- Erro de câmera vira instrução humana, não pilha de erro técnica.

## Checklist da tela de nova encomenda

1. Botão "Câmera" abre stream com `facingMode: environment`.
2. Botão "Anexar" abre câmera nativa do celular com fallback para galeria.
3. Botão "Capturar" só aparece quando o stream está ativo.
4. Botão "Retomar" reinicia o stream sem perder o estado da etiqueta capturada.
5. Botão "Ler etiqueta" só fica ativo com foto presente.
6. Busca de morador exige no mínimo 2 caracteres.
7. Resultados mostram nome, bloco, apto e telefone.
8. Resultado selecionado fixa o morador, libera o botão "Registrar encomenda".
9. Após sucesso, mostrar bloco verde com nome do morador, link WhatsApp pronto e atalho para nova encomenda.

## Erros a evitar

- Pedir CEP, e-mail ou dados que a portaria não tem.
- Bloquear cadastro porque OCR falhou.
- Esconder o botão de envio em estados intermediários.
- Reiniciar o formulário sem aviso ao operador.

## Saída

Fluxo cobre 100% dos critérios de aceite do PDR seção 7.3 e 15.
