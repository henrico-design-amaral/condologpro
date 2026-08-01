import type { IntakeDraft } from '../types/domain';

const key = 'condologpro:intake-draft:v1';

export function newDraft(): IntakeDraft {
  return {
    id: crypto.randomUUID(),
    clientRequestId: crypto.randomUUID(),
    recipientName: '',
    trackingCode: '',
    carrierName: '',
    volumeType: 'package',
    quantity: 1,
    notes: '',
    unitId: '',
    residentId: '',
    duplicateOverrideReason: '',
    recognition: null
  };
}

export function loadDraft(): IntakeDraft {
  try {
    const value = localStorage.getItem(key);
    return value ? ({ ...newDraft(), ...JSON.parse(value) } as IntakeDraft) : newDraft();
  } catch {
    return newDraft();
  }
}

export function saveDraft(draft: IntakeDraft): void {
  localStorage.setItem(key, JSON.stringify(draft));
}

export function clearDraft(): void {
  localStorage.removeItem(key);
}
