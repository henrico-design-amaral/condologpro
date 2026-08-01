import 'dotenv/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.PUBLIC_SUPABASE_URL;
const key = process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const password = process.env.E2E_USER_PASSWORD;
if (!url || !key || !password) throw new Error('Supabase público e senha E2E não configurados.');

const condoA = '11111111-1111-4111-8111-111111111111';
const condoB = '22222222-2222-4222-8222-222222222222';

async function authenticated(emailKey: string): Promise<SupabaseClient> {
  const email = process.env[emailKey];
  if (!email) throw new Error(`${emailKey} não configurado.`);
  const client = createClient(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const signed = await client.auth.signInWithPassword({ email, password: password! });
  if (signed.error) throw signed.error;
  return client;
}

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

const [admin, frontDesk, tenantB, inactive] = await Promise.all([
  authenticated('E2E_ADMIN_EMAIL'),
  authenticated('E2E_FRONT_DESK_EMAIL'),
  authenticated('E2E_TENANT_B_EMAIL'),
  authenticated('E2E_INACTIVE_EMAIL')
]);

const ownResidents = await frontDesk
  .from('residents')
  .select('id')
  .eq('condominium_id', condoA)
  .limit(2);
assert(
  !ownResidents.error && (ownResidents.data?.length ?? 0) > 0,
  'Portaria não conseguiu ler o próprio condomínio.'
);
const crossedResidents = await frontDesk
  .from('residents')
  .select('id')
  .eq('condominium_id', condoB)
  .limit(2);
assert(
  !crossedResidents.error && crossedResidents.data?.length === 0,
  'RLS permitiu leitura cruzada de moradores.'
);
const crossedFromB = await tenantB
  .from('residents')
  .select('id')
  .eq('condominium_id', condoA)
  .limit(2);
assert(
  !crossedFromB.error && crossedFromB.data?.length === 0,
  'RLS permitiu leitura cruzada no sentido inverso.'
);

const blockedAdminAction = await frontDesk
  .from('blocks')
  .insert({ condominium_id: condoA, code: `BLOCKED-${Date.now()}`, label: 'Não deve existir' });
assert(blockedAdminAction.error, 'Portaria executou ação exclusiva da administração.');
const adminCode = `RLS-${Date.now()}`;
const allowedAdminAction = await admin
  .from('blocks')
  .insert({ condominium_id: condoA, code: adminCode, label: 'Validação RLS' })
  .select('id')
  .single();
assert(!allowedAdminAction.error, 'Administração foi bloqueada na ação permitida.');
await admin.from('blocks').update({ is_active: false }).eq('id', allowedAdminAction.data.id);

const inactivePackages = await inactive.from('packages').select('id').limit(1);
assert(
  !inactivePackages.error && inactivePackages.data?.length === 0,
  'Usuário inativo leu encomendas.'
);
const inactiveMemberships = await inactive.from('user_condominiums').select('id').limit(1);
assert(
  !inactiveMemberships.error && inactiveMemberships.data?.length === 0,
  'Usuário inativo leu vínculos operacionais.'
);

const path = `${condoA}/security-test/${crypto.randomUUID()}.jpg`;
const jpeg = Uint8Array.from(
  Buffer.from(
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9oADAMBAAIAAwAAABD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/EH//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/EH//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/EH//2Q==',
    'base64'
  )
);
const upload = await frontDesk.storage
  .from('package-evidence')
  .upload(path, jpeg, { contentType: 'image/jpeg' });
assert(!upload.error, 'Upload privado permitido falhou.');
const tenantBDownload = await tenantB.storage.from('package-evidence').download(path);
assert(tenantBDownload.error, 'Outro condomínio baixou imagem privada.');
const publicProbe = await fetch(`${url}/storage/v1/object/public/package-evidence/${path}`, {
  redirect: 'manual'
});
assert(!publicProbe.ok, 'Imagem privada respondeu pela URL pública.');
const signed = await frontDesk.storage.from('package-evidence').createSignedUrl(path, 1);
assert(!signed.error && signed.data.signedUrl, 'URL assinada não foi criada.');
const signedBeforeExpiry = await fetch(signed.data.signedUrl);
assert(signedBeforeExpiry.ok, 'URL assinada válida não abriu.');
await new Promise((resolve) => setTimeout(resolve, 2100));
const signedAfterExpiry = await fetch(signed.data.signedUrl);
assert(!signedAfterExpiry.ok, 'URL assinada continuou válida após expiração.');
await frontDesk.storage.from('package-evidence').remove([path]);

console.info(
  JSON.stringify({
    rls: 'passed',
    tenantIsolation: 'passed',
    adminBoundary: 'passed',
    inactiveUser: 'passed',
    privateStorage: 'passed',
    signedUrlExpiry: 'passed'
  })
);
