import Link from "next/link";

export default function MobilePendingPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white">
      <section className="mx-auto max-w-md">
        <Link href="/mobile" className="text-sm text-neutral-400">
          ← Voltar
        </Link>

        <h1 className="mt-6 text-3xl font-semibold">Pendentes</h1>
        <p className="mt-3 text-neutral-300">
          Lista futura de encomendas ainda não retiradas.
        </p>
      </section>
    </main>
  );
}
