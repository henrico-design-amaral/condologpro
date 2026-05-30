import Link from "next/link";

export default function MobileHomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white">
      <section className="mx-auto flex max-w-md flex-col gap-5">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
            Portaria
          </p>
          <h1 className="mt-2 text-3xl font-semibold">CondoLogPro</h1>
          <p className="mt-3 text-neutral-300">
            Registro rápido de encomendas recebidas na administração.
          </p>
        </div>

        <Link
          href="/mobile/intake"
          className="rounded-3xl bg-white px-6 py-6 text-center text-xl font-semibold text-neutral-950"
        >
          Nova encomenda
        </Link>

        <Link
          href="/mobile/pending"
          className="rounded-3xl border border-neutral-700 px-6 py-6 text-center text-xl font-semibold text-white"
        >
          Ver pendentes
        </Link>
      </section>
    </main>
  );
}
