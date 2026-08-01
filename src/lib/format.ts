import type { PackageStatus } from '../types/domain';

export const statusLabels: Record<PackageStatus, string> = {
  awaiting_identification: 'Aguardando identificação',
  awaiting_notification: 'Aguardando notificação',
  awaiting_pickup: 'Aguardando retirada',
  picked_up: 'Retirada concluída',
  returned: 'Devolvida',
  cancelled: 'Cancelada',
  problem: 'Com problema'
};

export function formatDateTime(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo'
  }).format(new Date(value));
}

export function digits(value: string): string {
  return value.replace(/\D/g, '');
}

export function phoneLast4(value: string | null | undefined): string | null {
  const normalized = digits(value ?? '');
  return normalized.length >= 4 ? normalized.slice(-4) : null;
}

export function maskPhone(value: string | null | undefined): string {
  const last4 = phoneLast4(value);
  return last4 ? `•••• ${last4}` : 'Telefone não informado';
}
