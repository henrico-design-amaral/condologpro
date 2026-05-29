import Link from "next/link";

export default function MobileIntakePage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white">
      <section className="mx-auto max-w-md">
        <Link href="/mobile" className="text-sm text-neutral-400">
          ← Voltar
        </Link>

        <h1 className="mt-6 text-3xl font-semibold">Nova encomenda</h1>
        <p className="mt-3 text-neutral-300">
          Este é o placeholder do fluxo mobile. Na próxima fase entram foto da etiqueta,
          bloco, apartamento, morador e WhatsApp assistido.
        </p>

        <div className="mt-8 rounded-3xl border border-dashed border-neutral-700 p-6 text-center text-neutral-400">
          Área futura: fotografar etiqueta
        </div>
      </section>
    </main>
  );
}
