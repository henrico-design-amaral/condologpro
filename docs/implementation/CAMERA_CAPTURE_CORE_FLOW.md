# Camera Capture Core Flow - CondoLogPro

## Regra de produto

A captura da etiqueta e o centro do recebimento mobile. Ela acelera a conferencia, mas nao pode impedir o registro da encomenda quando camera, permissao ou navegador falham.

## Implementacao atual

Rota: `/mobile/intake`.

Fluxo:

1. Operador toca em `Camera`.
2. O app tenta abrir `navigator.mediaDevices.getUserMedia`.
3. A camera traseira e preferida com `facingMode: { ideal: "environment" }`.
4. Se a camera abrir, o operador ve preview ao vivo e toca em `Capturar`.
5. A imagem capturada vira um `File` JPEG e pode ser enviada pelo upload.
6. O operador tambem pode usar `Anexar`, que renderiza:

```html
<input type="file" accept="image/jpeg,image/png,image/webp,image/*" capture="environment">
```

7. Se `getUserMedia` falhar, o upload/captura por arquivo continua disponivel.

## Erros tratados

- Navegador sem `getUserMedia`: orientar uso do upload.
- Contexto inseguro: explicar que camera direta exige HTTPS ou localhost.
- Permissao bloqueada: orientar liberacao no navegador ou uso do upload.
- Falha de captura: orientar fallback de upload.

## Contexto seguro

`getUserMedia` exige secure context. Em producao Vercel com HTTPS, a camera direta deve ser suportada quando o navegador permitir. Em localhost, navegadores costumam permitir testes locais. Em celular acessando `http://IP-DA-LAN:3000`, a camera direta pode falhar por contexto inseguro.

Por isso o fallback `<input capture="environment">` e obrigatorio e permanece sempre visivel.

## OCR

O OCR usa `tesseract.js` de forma experimental e nao bloqueante.

Comportamento:

- roda apenas quando o operador toca em `Ler etiqueta`;
- tenta sugerir codigo de rastreio, transportadora, apto provavel e nome possivel;
- classifica confianca como `Alta`, `Media` ou `Baixa`;
- aplica sugestoes somente quando o operador toca nelas;
- nao salva texto bruto do OCR.

## Acessibilidade operacional

- Botoes principais tem altura minima mobile-safe.
- Inputs tem labels.
- Erros explicam o proximo passo.
- A selecao de morador e obrigatoria para confirmar unidade e residente.
- A foto e fortemente priorizada, mas o cadastro nao fica bloqueado se a camera falhar.
