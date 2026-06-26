import { redirect } from "next/navigation";

import { isSafeInternalPath } from "@/lib/auth/policy";
import { SupabaseConfigurationError } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  async function login(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const requestedPath = String(formData.get("next") ?? "");
    const nextPath = isSafeInternalPath(requestedPath) ? requestedPath : "/mobile";

    let supabase;

    try {
      supabase = await createSupabaseServerClient();
    } catch (error) {
      if (error instanceof SupabaseConfigurationError) {
        redirect(`/login?error=auth-not-configured&next=${encodeURIComponent(nextPath)}`);
      }

      throw error;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      redirect(`/login?error=invalid-credentials&next=${encodeURIComponent(nextPath)}`);
    }

    redirect(nextPath);
  }

  const errorMessage =
    params.error === "auth-not-configured"
      ? "Autenticação não configurada neste ambiente."
      : params.error === "invalid-credentials"
        ? "E-mail ou senha inválidos."
        : null;

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-12 text-neutral-950">
      <section className="mx-auto max-w-md rounded-[8px] border border-neutral-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
          CondoLogPro
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Acesso operacional</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Entre com uma conta convidada e vinculada a um operador ativo do condomínio.
        </p>
        <form action={login} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={params.next ?? "/mobile"} />
          <label className="block text-sm font-medium">
            E-mail
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-[8px] border border-neutral-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Senha
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-[8px] border border-neutral-300 px-3 py-2"
            />
          </label>
          {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
          <button
            type="submit"
            className="w-full rounded-[8px] bg-neutral-950 px-4 py-2.5 font-semibold text-white"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
