import { beforeEach, describe, expect, it } from 'vitest';
import { clearDraft, loadDraft, newDraft, saveDraft } from '../../src/lib/draft';

describe('rascunho resiliente de recebimento', () => {
  beforeEach(() => localStorage.clear());

  it('preserva o trabalho e a chave idempotente após reload', () => {
    const draft = {
      ...newDraft(),
      recipientName: 'Destinatário manual',
      notes: 'Internet instável'
    };
    saveDraft(draft);
    expect(loadDraft()).toEqual(draft);
  });

  it('limpa somente depois da confirmação de persistência', () => {
    saveDraft({ ...newDraft(), recipientName: 'Ana' });
    clearDraft();
    expect(loadDraft().recipientName).toBe('');
  });
});
