import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Building2, MapPin, MessageCircle, Phone } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { ADMIN_ROLES } from "@/lib/auth/policy";
import { requirePageOperator } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

async function updateOrganization(formData: FormData) {
  "use server";

  const operator = await requirePageOperator(ADMIN_ROLES, "/admin/settings");
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const whatsappPhone = String(formData.get("whatsappPhone") ?? "").trim();

  if (!name) {
    return;
  }

  await prisma.organization.update({
    where: { id: operator.organizationId },
    data: {
      name,
      address: address || null,
      whatsappPhone: whatsappPhone || null
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/settings");
}

export default async function AdminSettingsPage() {
  const operator = await requirePageOperator(ADMIN_ROLES, "/admin/settings");
  const [organization, totals] = await Promise.all([
    prisma.organization.findFirst({
      where: { id: operator.organizationId },
      orderBy: { createdAt: "asc" }
    }),
    Promise.all([
      prisma.building.count({ where: { organizationId: operator.organizationId } }),
      prisma.unit.count({ where: { organizationId: operator.organizationId } }),
      prisma.resident.count({ where: { organizationId: operator.organizationId } }),
      prisma.package.count({ where: { organizationId: operator.organizationId } })
    ])
  ]);

  const [buildingCount, unitCount, residentCount, packageCount] = totals;

  if (!organization) {
    return (
      <main className="min-h-screen bg-neutral-100 px-6 py-8 text-neutral-950">
        <section className="mx-auto max-w-3xl">
          <header>
            <Link
              href="/admin"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950"
            >
              ← Voltar ao painel
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Configurações</h1>
          </header>
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Nenhum condomínio configurado. Rode <code>npm run db:seed</code> para criar a organização demo
            antes de ajustar as configurações.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-8 text-neutral-950">
      <section className="mx-auto max-w-5xl">
        <header>
          <Link
            href="/admin"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950"
          >
            ← Voltar ao painel
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Configurações</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Dados do condomínio usados na geração de mensagens WhatsApp e no histórico.
          </p>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <article className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Blocos</p>
            <p className="mt-2 text-2xl font-semibold">{buildingCount}</p>
          </article>
          <article className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Unidades</p>
            <p className="mt-2 text-2xl font-semibold">{unitCount}</p>
          </article>
          <article className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Moradores</p>
            <p className="mt-2 text-2xl font-semibold">{residentCount}</p>
          </article>
          <article className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Encomendas</p>
            <p className="mt-2 text-2xl font-semibold">{packageCount}</p>
          </article>
        </div>

        <form action={updateOrganization} className="mt-6 grid gap-4 rounded-xl border border-neutral-200 bg-white p-5">
          <input type="hidden" name="organizationId" value={organization.id} />
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-4 w-4 text-neutral-500" aria-hidden="true" />
            Identidade do condomínio
          </h2>
          <label className="grid gap-1 text-sm font-semibold text-neutral-700">
            Nome do condomínio
            <input
              required
              name="name"
              defaultValue={organization.name}
              className="min-h-12 rounded-lg border border-neutral-300 px-3 text-base font-normal outline-none focus:ring-2 focus:ring-neutral-950"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-neutral-700">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-neutral-500" aria-hidden="true" />
              Endereço
            </span>
            <input
              name="address"
              defaultValue={organization.address ?? ""}
              className="min-h-12 rounded-lg border border-neutral-300 px-3 text-base font-normal outline-none focus:ring-2 focus:ring-neutral-950"
              placeholder="Rua, número, bairro, cidade"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-neutral-700">
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-neutral-500" aria-hidden="true" />
              Telefone institucional (WhatsApp)
            </span>
            <input
              name="whatsappPhone"
              defaultValue={organization.whatsappPhone ?? ""}
              className="min-h-12 rounded-lg border border-neutral-300 px-3 text-base font-normal outline-none focus:ring-2 focus:ring-neutral-950"
              placeholder="DDD + número"
            />
            <span className="text-xs text-neutral-500">
              Não obrigatório para o MVP. Usado em rodapés de mensagem se for adicionado em versões futuras.
            </span>
          </label>
          <div>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-neutral-950 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-white"
            >
              Salvar configurações
            </button>
          </div>
        </form>

        <section className="mt-6 grid gap-4 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <MessageCircle className="h-4 w-4 text-neutral-500" aria-hidden="true" />
            Regras operacionais ativas no MVP
          </h2>
          <ul className="grid gap-2 text-sm text-neutral-700">
            <li>• Banco local SQLite em <code>prisma/dev.db</code>.</li>
            <li>• Notificações via WhatsApp assistido <code>wa.me</code> sem API oficial.</li>
            <li>• Encomendas com mais de 24h em status pendente ou avisado são marcadas como atrasadas.</li>
            <li>• Upload de etiqueta salvo em <code>public/uploads</code>.</li>
            <li>• OCR experimental opcional, com fallback manual sempre disponível.</li>
            <li>• Multi-tenant, billing e autenticação complexa estão fora do escopo.</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
