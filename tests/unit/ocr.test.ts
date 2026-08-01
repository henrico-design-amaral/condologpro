import { describe, expect, it } from 'vitest';
import { extractLabelFields } from '../../src/lib/ocr';

describe('extração assistiva de etiqueta', () => {
  it('extrai campos previsíveis sem decidir pelo operador', () => {
    const result = extractLabelFields(
      'DESTINATÁRIO: Ana Beatriz\nBLOCO: 12\nAPTO: 1203\nCorreios\nAB123456789BR',
      91
    );
    expect(result.fields).toMatchObject({
      recipientName: 'Ana Beatriz',
      block: '12',
      unit: '1203',
      carrier: 'Correios',
      trackingCode: 'AB123456789BR'
    });
    expect(result.lowConfidence).toBe(false);
  });

  it.each([
    ['texto parcial', 'Ana\nAPTO 7', 42],
    ['inclinação simulada por ruído', 'D3ST1NATARIO ???\nBL0C0 A\nXPTO 12', 28],
    ['OCR inválido', '### 000 ???', 3]
  ])('marca baixa confiança em %s', (_name, text, confidence) => {
    expect(extractLabelFields(text, confidence).lowConfidence).toBe(true);
  });

  it('aceita ausência completa de bloco sem lançar erro', () => {
    const result = extractLabelFields('DESTINATÁRIO: Carlos Nunes\nTRACK BR999999999BR', 72);
    expect(result.fields.block).toBe('');
    expect(result.fields.recipientName).toBe('Carlos Nunes');
  });
});
