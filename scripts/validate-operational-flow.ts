import 'dotenv/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.PUBLIC_SUPABASE_URL;
const key = process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const password = process.env.E2E_USER_PASSWORD;
if (!url || !key || !password) throw new Error('Ambiente E2E não configurado.');

async function login(emailKey: string): Promise<SupabaseClient> {
  const email = process.env[emailKey];
  if (!email) throw new Error(`${emailKey} ausente.`);
  const client = createClient(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const result = await client.auth.signInWithPassword({ email, password: password! });
  if (result.error) throw result.error;
  return client;
}

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

const [operatorA, operatorB] = await Promise.all([
  login('E2E_FRONT_DESK_EMAIL'),
  login('E2E_SECOND_OPERATOR_EMAIL')
]);
const condominiumId = '11111111-1111-4111-8111-111111111111';
const residentQuery = await operatorA.rpc('search_residents', {
  p_condominium_id: condominiumId,
  p_query: 'Morador de Teste 001',
  p_limit: 1
});
assert(!residentQuery.error && residentQuery.data?.[0], 'Fixture de morador não encontrada.');
const resident = residentQuery.data[0] as { resident_id: string; unit_id: string };
const packageId = crypto.randomUUID();
const intake = await operatorA.rpc('create_package_intake', {
  p_payload: {
    id: packageId,
    condominium_id: condominiumId,
    client_request_id: crypto.randomUUID(),
    unit_id: resident.unit_id,
    resident_id: resident.resident_id,
    recipient_name: 'Morador de Teste 001',
    tracking_code: `E2E${Date.now()}`,
    carrier_name: 'Teste automatizado',
    volume_type: 'package',
    quantity: 1,
    notes: 'Fluxo de validação operacional',
    images: [],
    recognition: { engine: 'manual-e2e', was_skipped: true }
  }
});
assert(!intake.error && intake.data === packageId, 'Recebimento não persistiu.');
const notify = await operatorA.rpc('record_package_notification', {
  p_package_id: packageId,
  p_rendered_message: 'Mensagem E2E confirmada pelo operador.',
  p_phone_last4: '0001',
  p_template_id: null,
  p_opened_at: new Date().toISOString()
});
assert(!notify.error, 'Confirmação de WhatsApp falhou.');
const current = await operatorA
  .from('packages')
  .select('version,status')
  .eq('id', packageId)
  .single();
assert(
  !current.error && current.data.status === 'awaiting_pickup',
  'Status após notificação está incorreto.'
);
const pickupPayload = {
  p_package_id: packageId,
  p_expected_version: current.data.version,
  p_picked_up_by_name: 'Pessoa de Teste',
  p_relation: 'resident',
  p_document_last4: '0001',
  p_proof_storage_path: null,
  p_notes: 'Concorrência E2E'
};
const attempts = await Promise.all([
  operatorA.rpc('complete_package_pickup', pickupPayload),
  operatorB.rpc('complete_package_pickup', pickupPayload)
]);
assert(
  attempts.filter((attempt) => !attempt.error).length === 1,
  'Controle de concorrência não produziu exatamente uma retirada.'
);
assert(
  attempts.filter((attempt) => attempt.error).length === 1,
  'Segunda retirada não foi recusada.'
);
const history = await operatorA
  .from('package_status_history')
  .select('to_status,changed_by')
  .eq('package_id', packageId)
  .order('created_at');
assert(
  !history.error && history.data?.some((event) => event.to_status === 'picked_up'),
  'Histórico não registrou a retirada.'
);
const persisted = await operatorB
  .from('packages')
  .select('status,picked_up_at')
  .eq('id', packageId)
  .single();
assert(
  !persisted.error && persisted.data.status === 'picked_up' && persisted.data.picked_up_at,
  'Retirada não persistiu para outra sessão.'
);

console.info(
  JSON.stringify({
    intake: 'passed',
    notification: 'passed',
    pickup: 'passed',
    concurrency: 'passed',
    persistence: 'passed',
    packageId
  })
);
