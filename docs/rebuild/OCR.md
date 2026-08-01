# Câmera, imagem e OCR

## Decisão

O OCR é assistivo e local. `tesseract.js` roda no navegador com português e inglês; nenhuma etiqueta é enviada a um provedor de OCR. Falha, baixa confiança ou ausência de campo nunca impedem o preenchimento manual.

## Fluxo

1. `getUserMedia` solicita câmera traseira quando disponível.
2. Permissão negada ou navegador sem suporte produz mensagem explícita e mantém escolha de arquivo.
3. A foto tem preview antes de upload e pode ser refeita.
4. O original é preservado; uma versão WebP de até 1.600 px é criada para OCR/listagem.
5. SHA-256 do original, dimensões e tamanhos entram nos metadados.
6. O parser sugere destinatário, bloco, unidade, rastreio e transportadora.
7. Baixa confiança destaca revisão; operador corrige antes de salvar.
8. Upload só ocorre na confirmação final.

## Estados cobertos

- etiqueta nítida: Playwright executa Tesseract sobre PNG e exige sugestão editável;
- texto parcial, ruído/inclinação simulada, ausência de bloco e OCR inválido: testes unitários exigem baixa confiança/fallback;
- câmera permitida e negada: Playwright;
- arquivo inválido e acima de 10 MB: validação antes de processamento;
- rede falhou depois do upload: objetos são removidos e rascunho permanece.

O OCR reconhecido nunca é salvo silenciosamente: campos extraídos e corrigidos são armazenados separadamente.
