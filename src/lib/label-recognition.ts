export type LabelConfidence = "high" | "medium" | "low";

export type LabelSuggestionKey =
  | "residentQuery"
  | "building"
  | "apartment"
  | "postalCode"
  | "invoiceNumber"
  | "packageCode"
  | "routeCode"
  | "destinationCity"
  | "address";

export type LabelSuggestion = {
  key: LabelSuggestionKey;
  label: string;
  value: string;
  confidence: LabelConfidence;
  reason: string;
};

export type ParsedLabelFields = {
  packageCode?: string;
  invoiceNumber?: string;
  postalCode?: string;
  recipientName?: string;
  destinationCity?: string;
  address?: string;
  building?: string;
  apartment?: string;
  routeCode?: string;
};

export type LabelParseResult = {
  fields: ParsedLabelFields;
  suggestions: LabelSuggestion[];
  score: number;
  confidence: LabelConfidence;
  matchedPatterns: string[];
};

export type LabelRecognitionResult = LabelParseResult & {
  bestRotation: number;
  ocrCandidateCount: number;
  nativeBarcodeCount: number;
};

type OcrCandidateResult = LabelParseResult & {
  rotation: number;
  textLength: number;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
  detect(source: ImageBitmapSource): Promise<Array<{ rawValue?: string }>>;
};

const BRAZIL_STATES = "AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO";

const carrierHints = [
  "Correios",
  "Mercado Livre",
  "Shopee",
  "Amazon",
  "Jadlog",
  "Loggi",
  "Total Express",
  "Sequoia",
  "Kangu"
];

function normalizeSpaces(value: string) {
  return value.replace(/[ \t]+/g, " ").replace(/\s+\n/g, "\n").trim();
}

function normalizePostalCode(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : value.trim();
}

function cleanValue(value: string) {
  return value
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s:;.,-]+|[\s:;.,-]+$/g, "")
    .trim();
}

function isLikelyMetadataLine(line: string) {
  return /^(cep|nf|n\.f\.|nota fiscal|destino|cidade|volume|pedido|remetente|transportadora|rota|cod|c[oó]digo)\b/i.test(
    line
  );
}

function isAddressLine(line: string) {
  return /\b(?:rua|r\.?|avenida|av\.?|alameda|travessa|tv\.?|estrada|rodovia|pra[çc]a|condom[ií]nio)\b/i.test(line);
}

function lineValue(lines: string[], labels: RegExp[]) {
  for (const line of lines) {
    for (const label of labels) {
      const match = line.match(label);
      if (match?.[1]) {
        return cleanValue(match[1]);
      }
    }
  }

  return undefined;
}

function confidenceFromScore(score: number): LabelConfidence {
  if (score >= 12) {
    return "high";
  }

  if (score >= 6) {
    return "medium";
  }

  return "low";
}

function addSuggestion(
  suggestions: LabelSuggestion[],
  key: LabelSuggestionKey,
  value: string | undefined,
  confidence: LabelConfidence,
  reason: string
) {
  const cleaned = value ? cleanValue(value) : "";

  if (!cleaned) {
    return;
  }

  const labels: Record<LabelSuggestionKey, string> = {
    residentQuery: "Morador provável",
    building: "Bloco",
    apartment: "Apto",
    postalCode: "CEP",
    invoiceNumber: "NF",
    packageCode: "Código",
    routeCode: "Transportadora/rota",
    destinationCity: "Cidade destino",
    address: "Endereço"
  };

  if (suggestions.some((suggestion) => suggestion.key === key && suggestion.value === cleaned)) {
    return;
  }

  suggestions.push({
    key,
    label: labels[key],
    value: cleaned,
    confidence,
    reason
  });
}

function extractRecipient(lines: string[], addressLine?: string) {
  const explicit = lineValue(lines, [
    /\b(?:destinat[aá]rio|recebedor|nome)\s*[:.-]\s*(.{4,60})$/i,
    /\b(?:para)\s*[:.-]\s*(.{4,60})$/i
  ]);

  if (explicit && !isLikelyMetadataLine(explicit) && !isAddressLine(explicit)) {
    return explicit;
  }

  if (!addressLine) {
    return undefined;
  }

  const addressIndex = lines.findIndex((line) => line === addressLine);
  const previousLines = lines.slice(Math.max(0, addressIndex - 3), addressIndex).reverse();

  return previousLines.find((line) => {
    const cleaned = cleanValue(line);
    const wordCount = cleaned.split(/\s+/).length;
    return (
      cleaned.length >= 6 &&
      cleaned.length <= 60 &&
      wordCount >= 2 &&
      !isLikelyMetadataLine(cleaned) &&
      !isAddressLine(cleaned) &&
      !/\d{5}-?\d{3}/.test(cleaned) &&
      !new RegExp(`\\b(?:${BRAZIL_STATES})\\b`).test(cleaned)
    );
  });
}

function extractAddress(lines: string[]) {
  return lineValue(lines, [/\b(?:endere[cç]o|logradouro)\s*[:.-]\s*(.{6,90})$/i]) ?? lines.find(isAddressLine);
}

function extractDestinationCity(normalized: string, lines: string[]) {
  const explicit = normalized.match(
    new RegExp(
      `\\b(?:cidade\\s+(?:destino|de destino)|destino|munic[ií]pio)\\s*[:.-]?\\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿ .'-]{2,45})(?:\\s*[-/]\\s*(?:${BRAZIL_STATES}))?`,
      "i"
    )
  )?.[1];

  if (explicit) {
    return cleanValue(explicit);
  }

  for (const line of lines) {
    const match = line.match(new RegExp(`^([A-ZÀ-Ÿ][A-ZÀ-Ÿ .'-]{2,45})\\s*[-/]\\s*(?:${BRAZIL_STATES})$`, "i"));

    if (match?.[1] && !isLikelyMetadataLine(match[1]) && !isAddressLine(match[1])) {
      return cleanValue(match[1]);
    }
  }

  return undefined;
}

function extractBuildingApartment(normalized: string) {
  const combined = normalized.match(
    /\b(?:bloco|bl\.?|b)\s*[:.-]?\s*([A-Z]?\d{1,4}|[A-Z])\s*(?:apto|apartamento|apt\.?|ap\.?|unidade)\s*[:.-]?\s*(\d{1,5}[A-Z]?)/i
  );

  if (combined?.[1] && combined?.[2]) {
    return {
      building: combined[1].toUpperCase(),
      apartment: combined[2].toUpperCase()
    };
  }

  const building = normalized.match(/\b(?:bloco|bl\.?|b)\s*[:.-]?\s*([A-Z]?\d{1,4}|[A-Z])\b/i)?.[1];
  const apartment = normalized.match(/\b(?:apto|apartamento|apt\.?|ap\.?|unidade)\s*[:.-]?\s*(\d{1,5}[A-Z]?)\b/i)?.[1];

  return {
    building: building?.toUpperCase(),
    apartment: apartment?.toUpperCase()
  };
}

function extractPackageCode(normalized: string, postalCode?: string, invoiceNumber?: string) {
  const candidates = [
    ...normalized.matchAll(/\b[A-Z]{2}\d{9}[A-Z]{2}\b/gi),
    ...normalized.matchAll(/\b\d{12,14}\b/g),
    ...normalized.matchAll(/\b[A-Z0-9]{10,18}\b/gi)
  ].map((match) => match[0].toUpperCase());

  const postalDigits = postalCode?.replace(/\D/g, "");

  return candidates.find((candidate) => {
    const digits = candidate.replace(/\D/g, "");
    return digits !== postalDigits && digits !== invoiceNumber && !/^0+$/.test(digits);
  });
}

function extractRouteCode(normalized: string) {
  const explicit = normalized.match(/\b(?:rota|route|setor|triagem)\s*[:.-]?\s*([A-Z]{2,5}\d{1,5})\b/i)?.[1];

  if (explicit) {
    return explicit.toUpperCase();
  }

  return normalized.match(/\b[A-Z]{3,5}\d{1,4}\b/g)?.find((candidate) => !/^NF/i.test(candidate))?.toUpperCase();
}

export function parseLabelOcrText(rawText: string, barcodeValues: string[] = []): LabelParseResult {
  const text = normalizeSpaces(rawText);
  const normalized = text.replace(/\s+/g, " ").trim();
  const lines = text
    .split(/\r?\n/)
    .map(cleanValue)
    .filter(Boolean);
  const matchedPatterns: string[] = [];

  const explicitPostalCodeMatch = normalized.match(/\b(?:CEP|C\.?E\.?P\.?)\s*[:.-]?\s*(\d{5}-?\d{3})\b/i)?.[1];
  const postalCodeMatch = explicitPostalCodeMatch ?? normalized.match(/\b(\d{5}-?\d{3})\b/)?.[1];
  const postalCode = postalCodeMatch ? normalizePostalCode(postalCodeMatch) : undefined;

  const invoiceNumber = normalized.match(/\b(?:NF|N\.F\.|nota\s+fiscal)\s*[:#.\-]?\s*(\d{3,12})\b/i)?.[1];
  const { building, apartment } = extractBuildingApartment(normalized);
  const routeCode = extractRouteCode(normalized);
  const packageCode = barcodeValues[0] ?? extractPackageCode(normalized, postalCode, invoiceNumber);
  const address = extractAddress(lines);
  const destinationCity = extractDestinationCity(normalized, lines);
  const recipientName = extractRecipient(lines, address);

  const carrier = carrierHints.find((hint) => normalized.toLowerCase().includes(hint.toLowerCase()));
  const routeOrCarrier = carrier ?? routeCode;

  const fields: ParsedLabelFields = {
    packageCode,
    invoiceNumber,
    postalCode,
    recipientName,
    destinationCity,
    address,
    building,
    apartment,
    routeCode: routeOrCarrier
  };

  let score = 0;

  if (postalCode) {
    score += 3;
    matchedPatterns.push("CEP");
  }

  if (invoiceNumber) {
    score += 3;
    matchedPatterns.push("NF");
  }

  if (building) {
    score += 2;
    matchedPatterns.push("Bloco");
  }

  if (apartment) {
    score += 2;
    matchedPatterns.push("Apto");
  }

  if (destinationCity) {
    score += 2;
    matchedPatterns.push("Cidade destino");
  }

  if (address) {
    score += 2;
    matchedPatterns.push("Endereço");
  }

  if (recipientName) {
    score += 2;
    matchedPatterns.push("Destinatário");
  }

  if (routeOrCarrier) {
    score += 2;
    matchedPatterns.push("Rota/transportadora");
  }

  if (packageCode) {
    score += barcodeValues.length > 0 ? 4 : 2;
    matchedPatterns.push(barcodeValues.length > 0 ? "Código de barras/QR" : "Código");
  }

  const confidence = confidenceFromScore(score);
  const suggestions: LabelSuggestion[] = [];
  const residentValue = [recipientName, building ? `Bloco ${building}` : undefined, apartment ? `Apto ${apartment}` : undefined]
    .filter(Boolean)
    .join(" · ");

  addSuggestion(suggestions, "residentQuery", residentValue, recipientName && apartment ? "medium" : "low", "nome/bloco/apto extraidos da etiqueta");
  addSuggestion(suggestions, "building", building, building && apartment ? "high" : "medium", "padrao Bloco/Apto");
  addSuggestion(suggestions, "apartment", apartment, building && apartment ? "high" : "medium", "padrao Bloco/Apto");
  addSuggestion(suggestions, "postalCode", postalCode, explicitPostalCodeMatch ? "high" : "medium", "CEP com 8 digitos");
  addSuggestion(suggestions, "invoiceNumber", invoiceNumber, "high", "padrao NF/N.F./Nota Fiscal");
  addSuggestion(suggestions, "packageCode", packageCode, barcodeValues.length > 0 ? "high" : "medium", "codigo longo ou barcode/QR nativo");
  addSuggestion(suggestions, "routeCode", routeOrCarrier, carrier ? "medium" : "high", "rota/transportadora identificada");
  addSuggestion(suggestions, "destinationCity", destinationCity, "medium", "cidade/UF ou campo destino");
  addSuggestion(suggestions, "address", address, "medium", "linha de endereco");

  return {
    fields,
    suggestions,
    score,
    confidence,
    matchedPatterns
  };
}

async function loadImageSource(file: Blob) {
  if ("createImageBitmap" in window) {
    return createImageBitmap(file);
  }

  const url = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Nao foi possivel carregar a imagem da etiqueta."));
      element.src = url;
    });

    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function imageDimensions(source: ImageBitmap | HTMLImageElement) {
  return {
    width: source.width,
    height: source.height
  };
}

function enhanceCanvas(context: CanvasRenderingContext2D, width: number, height: number) {
  const image = context.getImageData(0, 0, width, height);
  const data = image.data;

  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.45 + 128));
    data[index] = contrasted;
    data[index + 1] = contrasted;
    data[index + 2] = contrasted;
  }

  context.putImageData(image, 0, 0);
}

async function createRotationCandidate(source: ImageBitmap | HTMLImageElement, rotation: number) {
  const { width: originalWidth, height: originalHeight } = imageDimensions(source);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(originalWidth, originalHeight));
  const width = Math.max(1, Math.round(originalWidth * scale));
  const height = Math.max(1, Math.round(originalHeight * scale));
  const rotated = rotation === 90 || rotation === 270;
  const canvas = document.createElement("canvas");
  canvas.width = rotated ? height : width;
  canvas.height = rotated ? width : height;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Nao foi possivel preparar a imagem para OCR.");
  }

  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((rotation * Math.PI) / 180);
  context.drawImage(source, -width / 2, -height / 2, width, height);
  context.restore();
  enhanceCanvas(context, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));

  if (!blob) {
    throw new Error("Nao foi possivel gerar candidato de OCR.");
  }

  return { rotation, blob };
}

async function readNativeBarcodes(file: Blob) {
  const Detector = (globalThis as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;

  if (!Detector || !("createImageBitmap" in window)) {
    return [];
  }

  try {
    const detector = new Detector({
      formats: ["qr_code", "code_128", "code_39", "ean_13", "ean_8", "itf", "upc_a", "upc_e"]
    });
    const bitmap = await createImageBitmap(file);

    try {
      const values = await detector.detect(bitmap);
      return values.map((value) => value.rawValue?.trim()).filter((value): value is string => Boolean(value));
    } finally {
      bitmap.close();
    }
  } catch {
    return [];
  }
}

export async function recognizeLabelImage(file: Blob): Promise<LabelRecognitionResult> {
  const barcodeValues = await readNativeBarcodes(file);
  const source = await loadImageSource(file);

  try {
    const candidates = await Promise.all([0, 90, 180, 270].map((rotation) => createRotationCandidate(source, rotation)));
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("por");
    const results: OcrCandidateResult[] = [];

    try {
      for (const candidate of candidates) {
        const result = await worker.recognize(candidate.blob);
        const parsed = parseLabelOcrText(result.data.text, barcodeValues);
        results.push({
          ...parsed,
          rotation: candidate.rotation,
          textLength: result.data.text.trim().length
        });
      }
    } finally {
      await worker.terminate();
    }

    const best = results.sort((a, b) => b.score - a.score || b.textLength - a.textLength)[0] ?? {
      ...parseLabelOcrText("", barcodeValues),
      rotation: 0,
      textLength: 0
    };

    return {
      fields: best.fields,
      suggestions: best.suggestions,
      score: best.score,
      confidence: best.confidence,
      matchedPatterns: best.matchedPatterns,
      bestRotation: best.rotation,
      ocrCandidateCount: candidates.length,
      nativeBarcodeCount: barcodeValues.length
    };
  } finally {
    if ("close" in source && typeof source.close === "function") {
      source.close();
    }
  }
}
