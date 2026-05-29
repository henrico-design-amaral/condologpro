import Link from "next/link";

const navItems = [
  { href: "/admin/residents", label: "Moradores" },
  { href: "/admin/packages", label: "Encomendas" },
  { href: "/admin/import", label: "Importar base" },
  { href: "/admin/settings", label: "Configurações" }
];

export default function AdminHomePage() {
  return (
    <main className="min-h-screen px-8 py-8">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          Administração
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Painel CondoLogPro
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-700">
          Controle desktop para base de moradores, encomendas, importação e
          acompanhamento operacional.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-neutral-200 bg-white p-5 font-medium shadow-sm"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
