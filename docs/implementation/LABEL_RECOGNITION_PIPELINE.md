# Label Recognition Pipeline

## Why the previous OCR failed

The previous intake flow sent the original captured file directly to `tesseract.js` and parsed the raw text with a small inline regex set. That approach was fragile for real labels because the provided sample has rotated text, wrinkled paper, partial cropping, multiple text orientations, large sorting codes, barcode/QR elements and several field labels competing for OCR attention.

The new pipeline keeps OCR optional and non-blocking. Manual registration remains the fallback at all times.

## Browser preprocessing

`src/lib/label-recognition.ts` prepares image candidates in the browser before OCR:

- loads the captured `File`/`Blob`;
- downscales the largest side to 1600 px;
- tries rotations at 0, 90, 180 and 270 degrees;
- converts pixels to grayscale;
- boosts contrast before recognition.

Thresholding is not enabled as a separate OCR pass yet. The current contrast pass is intentionally conservative to avoid making wrinkled or cropped text disappear.

## Rotation strategy

Each rotation candidate is recognized by `tesseract.js`. The parser scores each OCR result by useful package-label evidence, then the UI receives only the best structured result:

- CEP;
- NF / N.F. / Nota Fiscal;
- Bloco;
- Apto / Apartamento / Ap.;
- cidade destino;
- endereco;
- destinatario;
- route/sorting code;
- barcode-like package code.

Raw OCR text is not stored and is not sent to an API.

## Extracted fields

The parser returns structured suggestions for:

- `packageCode`;
- `invoiceNumber`;
- `postalCode`;
- `recipientName`;
- `destinationCity`;
- `address`;
- `building`;
- `apartment`;
- `routeCode`.

The mobile intake UI shows these as confirmable cards. Applying a suggestion is always an explicit operator action.

## Supported patterns

CEP:

- `CEP 04567-890`;
- `CEP: 04567890`;
- `C.E.P. 04567890`;
- any standalone 8-digit postal code as a medium-confidence fallback.

NF:

- `NF: 124824`;
- `N.F. 124824`;
- `Nota Fiscal: 124824`.

Bloco/Apto:

- `Bloco 40 Apto 34`;
- `Bloco 40 Apartamento 34`;
- `Bl. 40 Ap. 34`;
- `B40 Apto 34`.

Route/sorting code:

- explicit `Rota`, `Route`, `Setor` or `Triagem` labels;
- compact route-like tokens such as `SSP34`.

Recipient/address:

- prefers explicit `Destinatario`, `Recebedor`, `Nome` or `Para` labels;
- otherwise infers a possible name only from lines close to a recognized address line;
- does not treat every uppercase line as a person name.

## Confidence model

The parser assigns points for matched evidence:

- CEP: 3;
- NF: 3;
- Bloco: 2;
- Apto: 2;
- cidade destino: 2;
- endereco: 2;
- destinatario: 2;
- route/transportadora: 2;
- package code: 2;
- native barcode/QR value: 4.

Overall confidence:

- high: score >= 12;
- medium: score >= 6;
- low: score < 6.

Individual suggestions also carry high, medium or low confidence based on whether the field came from explicit labels, paired Bloco/Apto patterns, native barcode/QR detection or weaker fallback patterns.

## Fallback behavior

OCR failure never blocks package intake:

- the operator can still select a resident manually;
- package code, carrier and notes remain editable;
- suggestions do not overwrite fields automatically;
- the operator must apply each suggestion before package creation.

Fields without a native package column, such as CEP, NF and address, are applied to the notes field only after confirmation.

## Barcode and QR support

The helper uses the browser-native `BarcodeDetector` API when available. If the browser does not expose that API, the pipeline continues with OCR-only extraction.

No additional barcode/QR dependency was added in this implementation. A maintained browser-compatible reader, such as a ZXing-based package, can be evaluated later if native detection is not reliable on the target portaria devices.

## Known limitations

- Tesseract recognition still depends on photo quality, focus and available device CPU.
- Multiple text orientations on the same label can still produce partial OCR.
- The parser is generic and should not hardcode a resident, address or exact sample value.
- Address and recipient extraction are heuristics, so the UI treats them as suggestions only.
- Native barcode/QR support varies by browser.

## Next steps

- Test with several real labels from the condominium operation.
- Add target-device browser checks for `BarcodeDetector`.
- Consider a lightweight ZXing reader if native detection is absent on production phones.
- Add cropped-region OCR passes only if real samples show a consistent layout region worth targeting.
