import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

const allowedOrigins = new Set([
  'http://127.0.0.1:4321',
  'http://localhost:4321',
  'http://127.0.0.1:4329',
  'http://localhost:4329',
  'https://condologpro.henrico.works'
]);

const roles = new Set(['admin', 'front_desk', 'manager']);

function corsHeaders(request: Request) {
  const origin = request.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin)
      ? origin
      : 'https://condologpro.henrico.works',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin'
  };
}

function json(request: Request, body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders(request) });
}

const invite = withSupabase({ auth: 'user' }, async (request, context) => {
  const callerId = context.userClaims?.sub;
  if (!callerId) return json(request, { error: 'Sessão inválida.' }, 401);

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(request, { error: 'Corpo da solicitação inválido.' }, 400);
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const fullName = typeof payload.fullName === 'string' ? payload.fullName.trim() : '';
  const condominiumId = typeof payload.condominiumId === 'string' ? payload.condominiumId : '';
  const roleCode = typeof payload.roleCode === 'string' ? payload.roleCode : '';
  const redirectTo = typeof payload.redirectTo === 'string' ? payload.redirectTo : undefined;

  if (
    !/^\S+@\S+\.\S+$/.test(email) ||
    fullName.length < 2 ||
    !roles.has(roleCode) ||
    !/^[0-9a-f-]{36}$/i.test(condominiumId)
  ) {
    return json(request, { error: 'Preencha e-mail, nome, condomínio e papel válidos.' }, 400);
  }

  const { data: callerProfile } = await context.supabaseAdmin
    .from('profiles')
    .select('is_active')
    .eq('id', callerId)
    .maybeSingle();

  const { data: membership } = await context.supabaseAdmin
    .from('user_condominiums')
    .select('id, is_active, user_roles!inner(roles!inner(code))')
    .eq('user_id', callerId)
    .eq('condominium_id', condominiumId)
    .eq('is_active', true)
    .eq('user_roles.roles.code', 'admin')
    .maybeSingle();

  if (!callerProfile?.is_active || !membership) {
    return json(request, { error: 'Somente a administração pode convidar usuários.' }, 403);
  }

  let safeRedirect: string | undefined;
  try {
    if (redirectTo && allowedOrigins.has(new URL(redirectTo).origin)) safeRedirect = redirectTo;
  } catch {
    safeRedirect = undefined;
  }

  const { data: invited, error: inviteError } =
    await context.supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      ...(safeRedirect ? { redirectTo: safeRedirect } : {})
    });

  if (inviteError || !invited.user) {
    return json(
      request,
      { error: inviteError?.message ?? 'Não foi possível criar o convite.' },
      409
    );
  }

  const { error: profileError } = await context.supabaseAdmin
    .from('profiles')
    .update({ full_name: fullName, is_active: true })
    .eq('id', invited.user.id);

  const { data: targetMembership, error: membershipError } = await context.supabaseAdmin
    .from('user_condominiums')
    .upsert(
      {
        user_id: invited.user.id,
        condominium_id: condominiumId,
        is_active: true,
        invited_by: callerId
      },
      { onConflict: 'user_id,condominium_id' }
    )
    .select('id')
    .single();

  const { data: role } = await context.supabaseAdmin
    .from('roles')
    .select('id')
    .eq('code', roleCode)
    .single();

  if (profileError || membershipError || !targetMembership || !role) {
    await context.supabaseAdmin.auth.admin.deleteUser(invited.user.id);
    return json(
      request,
      { error: 'Não foi possível concluir o vínculo operacional. O convite foi revertido.' },
      500
    );
  }

  const { error: roleError } = await context.supabaseAdmin
    .from('user_roles')
    .upsert(
      { membership_id: targetMembership.id, role_id: role.id },
      { onConflict: 'membership_id,role_id' }
    );

  if (roleError) {
    await context.supabaseAdmin.auth.admin.deleteUser(invited.user.id);
    return json(
      request,
      { error: 'Não foi possível concluir o papel operacional. O convite foi revertido.' },
      500
    );
  }

  return json(request, { invitedUserId: invited.user.id, email, roleCode }, 201);
});

export default {
  fetch(request: Request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    if (request.method !== 'POST') return json(request, { error: 'Método não permitido.' }, 405);
    return invite(request);
  }
};
