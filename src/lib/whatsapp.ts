import { digits } from './format';

export interface WhatsAppTemplateData {
  condominium: string;
  recipient: string;
  unit: string;
  trackingCode?: string | null;
}

export const defaultWhatsAppTemplate =
  'Olá, {{morador}}. Uma encomenda foi recebida na portaria do {{condominio}} para {{unidade}}{{codigo}}. Apresente-se na portaria para a retirada.';

export function renderWhatsAppMessage(template: string, data: WhatsAppTemplateData): string {
  const code = data.trackingCode ? ` (código ${data.trackingCode})` : '';
  return template
    .replaceAll('{{morador}}', data.recipient)
    .replaceAll('{{condominio}}', data.condominium)
    .replaceAll('{{unidade}}', data.unit)
    .replaceAll('{{codigo}}', code)
    .trim();
}

export function whatsappUrl(phone: string, message: string): string {
  const normalized = digits(phone);
  if (normalized.length < 10) throw new Error('INVALID_WHATSAPP_PHONE');
  const withCountry = normalized.length <= 11 ? `55${normalized}` : normalized;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}
