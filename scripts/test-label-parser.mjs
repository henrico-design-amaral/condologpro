import assert from "node:assert/strict";

import { parseLabelOcrText } from "../src/lib/label-recognition.ts";

const sampleLikeText = `
SSP34
TER 20/08/2024
NF: 124824
CEP 04567-890
Cidade destino: SAO PAULO - SP
Destinatario: Maria Helena Costa
Rua das Palmeiras, 123
Complemento Bloco 40 Apto 34
Codigo 7891234567890
`;

const abbreviatedUnitText = `
N.F. 778899
C.E.P. 04567890
JOAO CARLOS ALMEIDA
Av. Brasil, 450
Bl. 40 Ap. 34
`;

const compactBuildingText = `
Nota Fiscal: 124824
CEP: 04567-890
Destino SANTOS/SP
Recebedor: Ana Paula Souza
Rua Central 12
B40 Apto 34
`;

const parsed = parseLabelOcrText(sampleLikeText);
assert.equal(parsed.fields.postalCode, "04567-890", "extracts CEP with hyphen");
assert.equal(parsed.fields.invoiceNumber, "124824", "extracts NF");
assert.equal(parsed.fields.building, "40", "extracts Bloco");
assert.equal(parsed.fields.apartment, "34", "extracts Apto");
assert.equal(parsed.fields.routeCode, "SSP34", "extracts route code");
assert.equal(parsed.fields.recipientName, "Maria Helena Costa", "extracts explicit recipient");
assert.equal(parsed.fields.address, "Rua das Palmeiras, 123", "extracts address line");
assert.equal(parsed.fields.packageCode, "7891234567890", "extracts barcode-like code");
assert.equal(parsed.confidence, "high", "sample-like label has high confidence");

const abbreviated = parseLabelOcrText(abbreviatedUnitText);
assert.equal(abbreviated.fields.postalCode, "04567-890", "normalizes CEP without hyphen");
assert.equal(abbreviated.fields.invoiceNumber, "778899", "supports N.F.");
assert.equal(abbreviated.fields.building, "40", "supports Bl.");
assert.equal(abbreviated.fields.apartment, "34", "supports Ap.");
assert.equal(abbreviated.fields.recipientName, "JOAO CARLOS ALMEIDA", "infers name near address");

const compact = parseLabelOcrText(compactBuildingText);
assert.equal(compact.fields.invoiceNumber, "124824", "supports Nota Fiscal");
assert.equal(compact.fields.building, "40", "supports B40");
assert.equal(compact.fields.apartment, "34", "supports B40 Apto 34");
assert.equal(compact.fields.destinationCity, "SANTOS", "extracts destination city");

console.log("label parser tests passed");
