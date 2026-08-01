import { describe, expect, it } from 'vitest';
import { renderWhatsAppMessage, whatsappUrl } from '../../src/lib/whatsapp';

describe('WhatsApp assistido', () => {
  it('renderiza somente variáveis aprovadas', () => {
    expect(
      renderWhatsAppMessage('{{morador}} · {{condominio}} · {{unidade}}{{codigo}}', {
        condominium: 'Condomínio Piloto',
        recipient: 'Ana',
        unit: 'Bloco A 12',
        trackingCode: 'BR123'
      })
    ).toBe('Ana · Condomínio Piloto · Bloco A 12 (código BR123)');
  });

  it('normaliza telefone brasileiro e codifica a mensagem', () => {
    expect(whatsappUrl('(11) 99999-0000', 'Olá, Ana')).toBe(
      'https://wa.me/5511999990000?text=Ol%C3%A1%2C%20Ana'
    );
  });

  it('recusa telefone que não pode ser acionado', () => {
    expect(() => whatsappUrl('123', 'teste')).toThrow('INVALID_WHATSAPP_PHONE');
  });
});
