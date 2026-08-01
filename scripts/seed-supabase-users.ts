import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.E2E_USER_PASSWORD;

if (!url || !serviceRole || !password) {
  throw new Error(
    'Defina PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e E2E_USER_PASSWORD somente no ambiente local.'
  );
}

const client = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const roles = new Map<string, string>();
const roleResult = await client.from('roles').select('id,code');
if (roleResult.error) throw roleResult.error;
for (const role of roleResult.data) roles.set(role.code, role.id);

const accounts = [
  {
    key: 'E2E_ADMIN_EMAIL',
    name: 'Admin Teste',
    condo: '11111111-1111-4111-8111-111111111111',
    role: 'admin',
    active: true
  },
  {
    key: 'E2E_FRONT_DESK_EMAIL',
    name: 'Portaria Teste',
    condo: '11111111-1111-4111-8111-111111111111',
    role: 'front_desk',
    active: true
  },
  {
    key: 'E2E_SECOND_OPERATOR_EMAIL',
    name: 'Portaria Concorrência',
    condo: '11111111-1111-4111-8111-111111111111',
    role: 'front_desk',
    active: true
  },
  {
    key: 'E2E_TENANT_B_EMAIL',
    name: 'Portaria Isolada',
    condo: '22222222-2222-4222-8222-222222222222',
    role: 'front_desk',
    active: true
  },
  {
    key: 'E2E_INACTIVE_EMAIL',
    name: 'Operador Inativo',
    condo: '11111111-1111-4111-8111-111111111111',
    role: 'front_desk',
    active: false
  }
] as const;

for (const account of accounts) {
  const email = process.env[account.key];
  if (!email) throw new Error(`Defina ${account.key}.`);
  const users = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw users.error;
  let user = users.data.users.find(
    (candidate) => candidate.email?.toLowerCase() === email.toLowerCase()
  );
  if (!user) {
    const created = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: account.name }
    });
    if (created.error) throw created.error;
    user = created.data.user;
  } else {
    const updated = await client.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: account.name }
    });
    if (updated.error) throw updated.error;
  }
  const profile = await client
    .from('profiles')
    .upsert({ id: user.id, full_name: account.name, is_active: account.active });
  if (profile.error) throw profile.error;
  const membership = await client
    .from('user_condominiums')
    .upsert(
      { user_id: user.id, condominium_id: account.condo, is_active: true },
      { onConflict: 'user_id,condominium_id' }
    )
    .select('id')
    .single();
  if (membership.error) throw membership.error;
  const roleId = roles.get(account.role);
  if (!roleId) throw new Error(`Papel ${account.role} não encontrado.`);
  const linked = await client
    .from('user_roles')
    .upsert(
      { membership_id: membership.data.id, role_id: roleId },
      { onConflict: 'membership_id,role_id' }
    );
  if (linked.error) throw linked.error;
}

console.info(
  `Seed de autenticação concluído para ${accounts.length} contas sem exibir credenciais.`
);
