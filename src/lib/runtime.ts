import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const runtimeReady = Boolean(url && publishableKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!runtimeReady || !url || !publishableKey) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }
  client ??= createClient(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  });
  return client;
}

export function friendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  if (/fetch|network|offline/i.test(message))
    return 'Conexão instável. Seu rascunho foi preservado; tente novamente.';
  if (/jwt|session|refresh_token/i.test(message))
    return 'Sua sessão expirou. Entre novamente para continuar.';
  if (/PACKAGE_ALREADY_PICKED_UP/i.test(message))
    return 'Esta encomenda já foi retirada por outro operador.';
  if (/PACKAGE_VERSION_CONFLICT/i.test(message))
    return 'O registro mudou em outra sessão. Atualize e confira antes de tentar novamente.';
  if (/ACCESS_DENIED|permission|policy/i.test(message))
    return 'Você não tem permissão para executar esta ação.';
  if (/duplicate|unique/i.test(message))
    return 'Já existe um registro equivalente. Atualize a lista antes de continuar.';
  if (/SUPABASE_NOT_CONFIGURED/i.test(message))
    return 'Ambiente sem conexão configurada com o Supabase.';
  return 'A operação não pôde ser concluída. O trabalho preenchido foi mantido.';
}
