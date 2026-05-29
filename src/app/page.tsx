import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
            CondoLogPro
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-950">
            Gestão de encomendas condominiais.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-neutral-700">
            MVP local-first para registrar entradas, fotografar etiquetas,
            avisar moradores por WhatsApp assistido e controlar retiradas.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/mobile"
              className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white"
            >
              Abrir portaria mobile
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-950"
            >
              Abrir admin desktop
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
