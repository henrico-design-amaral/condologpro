# Camera Capture Core Flow — CondoLogPro

## Regra de produto

A captura da etiqueta é o centro do recebimento mobile. Ela acelera a conferência, mas não pode impedir o registro da encomenda quando câmera, permissão ou navegador falham.

## Implementação atual

Rota: `/mobile/intake`.

Fluxo:

1. Operador toca em `Câmera`.
2. O app tenta abrir `navigator.mediaDevices.getUserMedia`.
3. A câmera traseira é preferida com `facingMode: { ideal: "environment" }`.
4. Se a câmera abrir, o operador vê preview ao vivo e toca em `Capturar`.
5. A imagem capturada vira um `File` JPEG e pode ser enviada pelo upload.
6. O operador também pode usar `Anexar`, que renderiza:

```html
<input type="file" accept="image/jpeg,image/png,image/webp,image/*" capture="environment">
```

7. Se `getUserMedia` falhar, o upload/captura por arquivo continua disponível.

## Erros tratados

- Navegador sem `getUserMedia`: orientar uso do upload.
- Contexto inseguro: explicar que câmera direta exige HTTPS ou localhost.
- Permissão bloqueada: orientar liberação no navegador ou uso do upload.
- Falha de captura: orientar fallback de upload.

## Contexto seguro

`getUserMedia` exige secure context. Em produção Vercel com HTTPS, a câmera direta deve ser suportada quando o navegador permitir. Em localhost, navegadores costumam permitir testes locais. Em celular acessando `http://IP-DA-LAN:3000`, a câmera direta pode falhar por contexto inseguro.

Por isso o fallback `<input capture="environment">` é obrigatório e permanece sempre visível.

## OCR

O OCR usa `tesseract.js` de forma experimental e não bloqueante.

Comportamento:

- roda apenas quando o operador toca em `Ler etiqueta`;
- tenta sugerir código de rastreio, transportadora, apto provável e nome possível;
- classifica confiança como `Alta`, `Média` ou `Baixa`;
- aplica sugestões somente quando o operador toca nelas;
- não salva texto bruto do OCR.

## Acessibilidade operacional

- Botões principais têm altura mínima mobile-safe.
- Inputs têm labels.
- Erros explicam o próximo passo.
- A seleção de morador é obrigatória para confirmar unidade e residente.
- A foto é fortemente priorizada, mas o cadastro não fica bloqueado se a câmera falhar.
