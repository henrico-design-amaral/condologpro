import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-12 text-neutral-950">
      <section className="mx-auto max-w-md rounded-[8px] border border-neutral-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">
          Acesso bloqueado
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Operador sem permissão</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          A conta não está vinculada a um operador ativo ou não possui o papel exigido.
        </p>
        <Link href="/login" className="mt-6 inline-flex min-h-11 items-center rounded-[8px] bg-neutral-950 px-4 py-3 text-sm font-semibold text-white">
          Voltar ao login
        </Link>
      </section>
    </main>
  );
}
