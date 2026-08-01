import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const seed = readFileSync('supabase/seed.sql', 'utf8');

describe('seed de capacidade e isolamento', () => {
  it('modela 41 blocos e 34 unidades sem dados pessoais reais', () => {
    expect(seed).toContain('for block_number in 1..41');
    expect(seed).toContain('for unit_number in 1..34');
    expect(seed).toContain('@example.invalid');
    expect(seed).toContain('Dados estritamente sintéticos');
  });

  it('inclui segundo condomínio para prova de RLS', () => {
    expect(seed).toContain('22222222-2222-4222-8222-222222222222');
  });
});
