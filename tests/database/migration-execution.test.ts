import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const database = new PGlite();

function splitSql(sql: string): string[] {
  const statements: string[] = [];
  let start = 0;
  let single = false;
  let double = false;
  let lineComment = false;
  let dollarTag = '';
  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    const next = sql[index + 1];
    if (lineComment) {
      if (character === '\n') lineComment = false;
      continue;
    }
    if (!single && !double && !dollarTag && character === '-' && next === '-') {
      lineComment = true;
      index += 1;
      continue;
    }
    if (!double && !dollarTag && character === "'" && sql[index - 1] !== '\\') {
      single = !single;
      continue;
    }
    if (!single && !dollarTag && character === '"' && sql[index - 1] !== '\\') {
      double = !double;
      continue;
    }
    if (!single && !double && character === '$') {
      const match = /^\$[A-Za-z0-9_]*\$/.exec(sql.slice(index));
      if (match && (!dollarTag || match[0] === dollarTag)) {
        dollarTag = dollarTag ? '' : match[0];
        index += match[0].length - 1;
        continue;
      }
    }
    if (!single && !double && !dollarTag && character === ';') {
      const statement = sql.slice(start, index + 1).trim();
      if (statement) statements.push(statement);
      start = index + 1;
    }
  }
  const tail = sql.slice(start).trim();
  if (tail) statements.push(tail);
  return statements;
}

async function executeWithContext(sql: string): Promise<void> {
  const statements = splitSql(sql);
  for (const [index, statement] of statements.entries()) {
    try {
      await database.exec(statement);
    } catch (error) {
      throw new Error(
        `Falha SQL ${index + 1}/${statements.length}: ${statement.slice(0, 360)}\n${error instanceof Error ? error.message : ''}`
      );
    }
  }
}

function portableMigration(): string {
  return readFileSync(
    'supabase/migrations/20260801160101_rebuild_astro_supabase_foundation.sql',
    'utf8'
  )
    .replace(/^create extension .*;$/gm, '')
    .replaceAll('extensions.gen_random_uuid()', 'gen_random_uuid()')
    .replace(
      /create or replace function security\.normalize_text[\s\S]*?\$\$;/,
      () => `create or replace function security.normalize_text(value text)
       returns text language sql immutable strict set search_path = ''
       as $$ select lower(value); $$;`
    )
    .replace(/^create index residents_search_trgm_idx .*;$/gm, '');
}

beforeAll(async () => {
  await database.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create schema storage;
    create table auth.users (
      id uuid primary key default gen_random_uuid(),
      email text,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create or replace function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    create table storage.buckets (
      id text primary key,
      name text not null,
      public boolean not null default false,
      file_size_limit bigint,
      allowed_mime_types text[]
    );
    create table storage.objects (
      id uuid primary key default gen_random_uuid(),
      bucket_id text not null references storage.buckets(id),
      name text not null,
      owner_id text
    );
    create or replace function storage.foldername(value text) returns text[]
      language sql immutable as $$ select string_to_array(value, '/'); $$;
  `);
  await executeWithContext(portableMigration());
  await executeWithContext(readFileSync('supabase/seed.sql', 'utf8'));
}, 60_000);

afterAll(async () => database.close());

describe('migration executável em Postgres limpo', () => {
  it('cria o modelo, funções e seed de capacidade', async () => {
    const result = await database.query<{ blocks: number; units: number; residents: number }>(`
      select
        (select count(*)::integer from public.blocks where condominium_id = '11111111-1111-4111-8111-111111111111') as blocks,
        (select count(*)::integer from public.units where condominium_id = '11111111-1111-4111-8111-111111111111') as units,
        (select count(*)::integer from public.residents where condominium_id = '11111111-1111-4111-8111-111111111111') as residents
    `);
    expect(result.rows[0]).toEqual({ blocks: 41, units: 1394, residents: 120 });
  });

  it('mantém RLS habilitada em todas as tabelas expostas', async () => {
    const result = await database.query<{ missing: number }>(`
      select count(*)::integer as missing
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
    `);
    expect(result.rows[0]?.missing).toBe(0);
  });

  it('mantém o bucket privado', async () => {
    const result = await database.query<{ public: boolean }>(
      "select public from storage.buckets where id = 'package-evidence'"
    );
    expect(result.rows[0]?.public).toBe(false);
  });

  it('aplica isolamento, papel e bloqueio de usuário inativo com RLS real', async () => {
    const userA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const userB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const inactive = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    await database.exec(`
      insert into auth.users (id, email, raw_user_meta_data) values
        ('${userA}', 'a@example.invalid', '{"full_name":"Portaria A"}'),
        ('${userB}', 'b@example.invalid', '{"full_name":"Portaria B"}'),
        ('${inactive}', 'inactive@example.invalid', '{"full_name":"Inativo"}');
      update public.profiles set is_active = true where id in ('${userA}', '${userB}');
      insert into public.user_condominiums (id, user_id, condominium_id) values
        ('a1111111-1111-4111-8111-111111111111', '${userA}', '11111111-1111-4111-8111-111111111111'),
        ('b2222222-2222-4222-8222-222222222222', '${userB}', '22222222-2222-4222-8222-222222222222'),
        ('c1111111-1111-4111-8111-111111111111', '${inactive}', '11111111-1111-4111-8111-111111111111');
      insert into public.user_roles (membership_id, role_id)
      select membership.id, role.id
      from (values
        ('a1111111-1111-4111-8111-111111111111'::uuid),
        ('b2222222-2222-4222-8222-222222222222'::uuid),
        ('c1111111-1111-4111-8111-111111111111'::uuid)
      ) membership(id)
      cross join lateral (select id from public.roles where code = 'front_desk') role;
    `);

    await database.exec(
      `set role authenticated; select set_config('request.jwt.claim.sub', '${userA}', false);`
    );
    const own = await database.query<{ count: number }>(
      "select count(*)::integer as count from public.residents where condominium_id = '11111111-1111-4111-8111-111111111111'"
    );
    const crossed = await database.query<{ count: number }>(
      "select count(*)::integer as count from public.residents where condominium_id = '22222222-2222-4222-8222-222222222222'"
    );
    expect(own.rows[0]?.count).toBeGreaterThan(0);
    expect(crossed.rows[0]?.count).toBe(0);
    await expect(
      database.exec(
        "insert into public.blocks (condominium_id, code, label) values ('11111111-1111-4111-8111-111111111111', 'DENIED', 'Negado')"
      )
    ).rejects.toThrow();

    await database.exec(`select set_config('request.jwt.claim.sub', '${inactive}', false);`);
    const inactiveRows = await database.query<{ count: number }>(
      'select count(*)::integer as count from public.user_condominiums'
    );
    expect(inactiveRows.rows[0]?.count).toBe(0);
    await database.exec('reset role;');
  });
});
