import { ArrowRight, Camera, ClipboardCheck, MonitorCog } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-8 text-neutral-950">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[8px] border border-neutral-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            CondoLogPro
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">
            Controle de encomendas para portaria de condomínio.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
            MVP local-first para registrar entradas com foto da etiqueta, encontrar moradores,
            avisar por WhatsApp assistido e controlar retiradas.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href="/mobile"
              className="flex min-h-16 items-center justify-between rounded-[8px] bg-neutral-950 px-5 py-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-white"
            >
              <span className="flex items-center gap-3">
                <Camera className="h-5 w-5" aria-hidden="true" />
                Abrir portaria mobile
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/admin"
              className="flex min-h-16 items-center justify-between rounded-[8px] border border-neutral-300 bg-white px-5 py-4 text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-white"
            >
              <span className="flex items-center gap-3">
                <MonitorCog className="h-5 w-5" aria-hidden="true" />
                Abrir admin desktop
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <aside className="grid gap-3">
          {[
            "Entrada por câmera ou upload",
            "Autocomplete de morador",
            "Aviso assistido por WhatsApp",
            "Pendências e retiradas auditáveis"
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-[8px] border border-neutral-200 bg-white p-4">
              <ClipboardCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
              <span className="text-sm font-semibold text-neutral-800">{item}</span>
            </div>
          ))}
        </aside>
      </section>
    </main>
  );
}
