import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/packages", label: "Encomendas" },
  { href: "/admin/residents", label: "Moradores" },
  { href: "/admin/import", label: "Importar" },
  { href: "/admin/settings", label: "Configurações" }
];

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-6 py-0">
          <Link
            href="/admin"
            className="mr-6 flex items-center gap-2 py-4 text-sm font-semibold text-neutral-950"
          >
            <span className="rounded-lg bg-neutral-950 px-2 py-1 text-xs font-bold text-white">
              CLP
            </span>
            <span className="hidden sm:inline">CondoLogPro</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto">
            <Link
              href="/mobile"
              className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100"
            >
              Portaria mobile →
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
