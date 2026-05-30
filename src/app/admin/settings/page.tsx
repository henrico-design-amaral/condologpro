import { getDefaultOrg } from "@/lib/data";

export default async function AdminSettingsPage() {
  const org = await getDefaultOrg();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Dados do condomínio e configurações operacionais.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {org ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
              Dados do condomínio
            </h2>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-xs text-neutral-500">Nome</dt>
                <dd className="mt-0.5 text-sm font-medium text-neutral-950">
                  {org.name}
                </dd>
              </div>
              {org.address && (
                <div>
                  <dt className="text-xs text-neutral-500">Endereço</dt>
                  <dd className="mt-0.5 text-sm text-neutral-700">
                    {org.address}
                  </dd>
                </div>
              )}
              {org.whatsappPhone && (
                <div>
                  <dt className="text-xs text-neutral-500">
                    WhatsApp institucional
                  </dt>
                  <dd className="mt-0.5 font-mono text-sm text-neutral-700">
                    {org.whatsappPhone}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-neutral-500">ID da organização</dt>
                <dd className="mt-0.5 font-mono text-xs text-neutral-400">
                  {org.id}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-6 text-neutral-500">
            Organização não encontrada. Execute o seed do banco de dados.
          </div>
        )}

        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
              Armazenamento
            </h2>
            <div className="mt-4 flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">
                ✓
              </span>
              <div>
                <p className="text-sm font-medium text-neutral-950">
                  Local-first ativo
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Banco SQLite armazenado localmente. Nenhum dado é enviado para
                  servidores externos. Funciona sem internet.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
              WhatsApp
            </h2>
            <div className="mt-4 flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-700">
                i
              </span>
              <div>
                <p className="text-sm font-medium text-neutral-950">
                  Envio assistido via wa.me
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  A notificação abre o WhatsApp com a mensagem pronta. O
                  operador revisa e envia manualmente. Não requer API
                  Business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
