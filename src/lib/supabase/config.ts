export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Supabase Auth não está configurado neste ambiente.");
    this.name = "SupabaseConfigurationError";
  }
}

export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !publishableKey) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ""),
    publishableKey
  };
}

export function requireSupabasePublicConfig(): SupabasePublicConfig {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new SupabaseConfigurationError();
  }

  return config;
}
