import type { RecognitionFields, RecognitionResult } from '../types/domain';

const emptyFields = (): RecognitionFields => ({
  recipientName: '',
  block: '',
  unit: '',
  trackingCode: '',
  carrier: ''
});

export function extractLabelFields(rawText: string, confidence = 0): RecognitionResult {
  const text = rawText.replace(/\r/g, '');
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const fields = emptyFields();
  const tracking = text.match(/\b[A-Z]{2}\d{8,10}[A-Z]{2}\b|\b[A-Z0-9]{9,22}\b/i);
  const unit = text.match(/(?:ap(?:to|artamento)?|unidade)\s*[:#-]?\s*([A-Z0-9-]{1,10})/i);
  const block = text.match(/(?:bloco|bl\.?|torre)\s*[:#-]?\s*([A-Z0-9-]{1,10})/i);
  const recipient = text.match(/(?:destinat[aá]rio|recebedor|nome)\s*[:#-]?\s*([^\n]{3,80})/i);
  const carriers = [
    'Correios',
    'Mercado Livre',
    'Amazon',
    'Shopee',
    'Jadlog',
    'Loggi',
    'Total Express'
  ];

  fields.trackingCode = tracking?.[0]?.toUpperCase() ?? '';
  fields.unit = unit?.[1] ?? '';
  fields.block = block?.[1] ?? '';
  fields.recipientName =
    recipient?.[1]?.trim() ?? lines.find((line) => /^[A-Za-zÀ-ÿ ]{5,80}$/.test(line)) ?? '';
  fields.carrier =
    carriers.find((carrier) =>
      text.toLocaleLowerCase('pt-BR').includes(carrier.toLocaleLowerCase('pt-BR'))
    ) ?? '';

  const found = Object.values(fields).filter(Boolean).length;
  return {
    fields,
    confidence,
    rawText: text.slice(0, 12000),
    lowConfidence: confidence < 65 || found < 2
  };
}

export async function recognizeLabel(
  file: File,
  onProgress: (progress: number) => void
): Promise<RecognitionResult> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('por+eng', undefined, {
    logger: (event) => {
      if (event.status === 'recognizing text' && typeof event.progress === 'number')
        onProgress(event.progress);
    }
  });
  try {
    const result = await worker.recognize(file);
    return extractLabelFields(result.data.text, result.data.confidence);
  } finally {
    await worker.terminate();
  }
}
