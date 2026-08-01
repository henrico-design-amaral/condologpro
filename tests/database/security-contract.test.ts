import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  'supabase/migrations/20260801160101_rebuild_astro_supabase_foundation.sql',
  'utf8'
).toLowerCase();
const exposedTables = [
  'condominiums',
  'profiles',
  'roles',
  'user_condominiums',
  'user_roles',
  'blocks',
  'units',
  'residents',
  'resident_units',
  'carriers',
  'message_templates',
  'packages',
  'package_images',
  'package_recognition_results',
  'package_notifications',
  'package_pickups',
  'package_status_history',
  'audit_events'
];

describe('contrato versionado de segurança Supabase', () => {
  it.each(exposedTables)('habilita RLS em %s', (table) => {
    expect(migration).toContain(`alter table public.${table} enable row level security`);
  });

  it('revoga exposição automática e limita RPCs a authenticated', () => {
    expect(migration).toContain(
      'revoke all on all tables in schema public from anon, authenticated'
    );
    expect(migration).toContain(
      'grant execute on function public.create_package_intake(jsonb) to authenticated'
    );
    expect(migration).not.toContain(
      'grant execute on function public.create_package_intake(jsonb) to anon'
    );
  });

  it('cria bucket privado e valida o condomínio pelo primeiro segmento', () => {
    expect(migration).toContain("'package-evidence',\n  'package-evidence',\n  false");
    expect(migration).toContain('security.try_uuid((storage.foldername(name))[1])');
    expect(migration).toContain('owner_id = (select auth.uid()::text)');
  });

  it('mantém concorrência e histórico reversível de retirada', () => {
    expect(migration).toContain('for update');
    expect(migration).toContain('package_version_conflict');
    expect(migration).toContain('pickups_one_active_per_package_idx');
    expect(migration).toContain('voided_at = now()');
  });
});
