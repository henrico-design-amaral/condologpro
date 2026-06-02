"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Loader2, Sparkles, Upload } from "lucide-react";

import {
  IMPORT_HEADERS_DESCRIPTION,
  IMPORT_TEMPLATE_CSV,
  type ImportPreview
} from "@/lib/import-csv";

type CommitResult = {
  created: {
    buildings: number;
    units: number;
    residents: number;
  };
  skipped: number;
};

export function ImportForm() {
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [commitResult, setCommitResult] = useState<CommitResult | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(file: File) {
    const text = await file.text();
    setCsvText(text);
    setCommitResult(null);
    setPreview(null);
    setError(null);
  }

  async function runPreview() {
    if (!csvText.trim()) {
      setError("Cole o CSV ou anexe um arquivo antes de simular a importação.");
      return;
    }

    setIsPreviewing(true);
    setError(null);
    setCommitResult(null);

    try {
      const response = await fetch("/api/import/residents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText, mode: "preview" })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível simular a importação.");
      }

      setPreview(data.preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao simular importação.");
    } finally {
      setIsPreviewing(false);
    }
  }

  async function runCommit() {
    if (!csvText.trim()) {
      setError("Cole o CSV antes de executar a importação.");
      return;
    }

    setIsCommitting(true);
    setError(null);

    try {
      const response = await fetch("/api/import/residents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText, mode: "commit" })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível concluir a importação.");
      }

      setCommitResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao executar importação.");
    } finally {
      setIsCommitting(false);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([IMPORT_TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "moradores-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const canCommit =
    !!preview &&
    preview.missingHeaders.length === 0 &&
    preview.validRows > 0 &&
    !isCommitting;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">CSV de moradores</h2>
            <p className="text-sm text-neutral-600">
              Cole o conteúdo ou anexe um arquivo. A simulação não escreve no banco.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-950"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Baixar template
          </button>
        </header>

        <label className="mt-4 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-700 hover:border-neutral-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-neutral-950">
          <Upload className="h-4 w-4" aria-hidden="true" />
          Anexar arquivo CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleFileChange(file);
              }
            }}
          />
        </label>

        <label className="mt-4 grid gap-2 text-sm font-semibold text-neutral-700">
          Conteúdo CSV
          <textarea
            value={csvText}
            onChange={(event) => {
              setCsvText(event.target.value);
              setPreview(null);
              setCommitResult(null);
            }}
            placeholder="bloco,apartamento,nome,telefone,principal,observacao"
            className="min-h-48 rounded-lg border border-neutral-300 px-3 py-2 font-mono text-xs text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-950"
            spellCheck={false}
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runPreview}
            disabled={isPreviewing}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-neutral-950 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60"
          >
            {isPreviewing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            Simular importação
          </button>
          <button
            type="button"
            onClick={runCommit}
            disabled={!canCommit}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-500"
          >
            {isCommitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            )}
            Executar importação
          </button>
        </div>

        {error ? (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            <AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : null}

        {commitResult ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="text-base font-semibold">Importação concluída.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>{commitResult.created.buildings} bloco(s) criado(s).</li>
              <li>{commitResult.created.units} unidade(s) criada(s).</li>
              <li>{commitResult.created.residents} morador(es) criado(s).</li>
              <li>{commitResult.skipped} morador(es) ignorado(s) (já existiam).</li>
            </ul>
          </div>
        ) : null}
      </section>

      <aside className="grid gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Formato esperado</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Cabeçalho na primeira linha. Separador vírgula ou ponto-e-vírgula.
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {IMPORT_HEADERS_DESCRIPTION.map((header) => (
              <li key={header.name} className="grid gap-1 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-semibold text-neutral-900">{header.name}</code>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      header.required
                        ? "bg-rose-100 text-rose-900"
                        : "bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    {header.required ? "Obrigatório" : "Opcional"}
                  </span>
                </div>
                <span className="text-xs text-neutral-600">Exemplo: {header.example}</span>
              </li>
            ))}
          </ul>
        </section>

        {preview ? (
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Resultado da simulação</h2>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-neutral-50 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Linhas</dt>
                <dd className="mt-1 text-xl font-semibold">{preview.totalRows}</dd>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3 text-emerald-900">
                <dt className="text-xs font-semibold uppercase tracking-wide">Válidas</dt>
                <dd className="mt-1 text-xl font-semibold">{preview.validRows}</dd>
              </div>
              <div className="rounded-lg bg-rose-50 p-3 text-rose-900">
                <dt className="text-xs font-semibold uppercase tracking-wide">Inválidas</dt>
                <dd className="mt-1 text-xl font-semibold">{preview.invalidRows}</dd>
              </div>
            </dl>

            {preview.missingHeaders.length > 0 ? (
              <p role="alert" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Cabeçalho incompleto. Faltando: {preview.missingHeaders.join(", ")}
              </p>
            ) : null}

            {preview.buildings.length > 0 ? (
              <p className="mt-4 text-sm text-neutral-700">
                <span className="font-semibold">Blocos detectados:</span>{" "}
                {preview.buildings.join(", ")}
              </p>
            ) : null}

            <div className="mt-4 max-h-72 overflow-y-auto rounded-lg border border-neutral-100">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-neutral-50 text-left uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Linha</th>
                    <th className="px-3 py-2 font-semibold">Bloco / Apto</th>
                    <th className="px-3 py-2 font-semibold">Morador</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 20).map((row) => (
                    <tr key={row.rowNumber} className="border-t border-neutral-100">
                      <td className="px-3 py-2 text-neutral-500">{row.rowNumber}</td>
                      <td className="px-3 py-2 font-medium">
                        {row.building || "—"} / {row.unit || "—"}
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-semibold">{row.name || "—"}</p>
                        <p className="text-neutral-500">{row.phone || "Telefone faltando"}</p>
                      </td>
                      <td className="px-3 py-2">
                        {row.errors.length === 0 ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-900">
                            OK
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-700">{row.errors.join(" · ")}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.rows.length > 20 ? (
              <p className="mt-2 text-xs text-neutral-500">
                Mostrando 20 de {preview.rows.length} linhas.
              </p>
            ) : null}
          </section>
        ) : null}
      </aside>
    </div>
  );
}
