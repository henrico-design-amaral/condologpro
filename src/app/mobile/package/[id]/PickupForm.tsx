"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  packageId: string;
};

export function PickupForm({ packageId }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/packages/${packageId}/pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickedUpByName: name.trim(),
          pickedUpByDocument: document.trim() || undefined,
          notes: notes.trim() || undefined
        })
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erro ao confirmar retirada.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao confirmar retirada.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="pickup-name"
          className="mb-2 block text-sm font-medium text-neutral-400"
        >
          Nome de quem retira <span className="text-white">*</span>
        </label>
        <input
          id="pickup-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome completo"
          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-4 text-base text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="pickup-doc"
          className="mb-2 block text-sm font-medium text-neutral-400"
        >
          Documento
          <span className="ml-1 text-neutral-600">(opcional)</span>
        </label>
        <input
          id="pickup-doc"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          placeholder="RG, CPF…"
          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-4 text-base text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="pickup-notes"
          className="mb-2 block text-sm font-medium text-neutral-400"
        >
          Observações
          <span className="ml-1 text-neutral-600">(opcional)</span>
        </label>
        <textarea
          id="pickup-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-base text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="w-full rounded-2xl bg-white py-5 text-lg font-semibold text-neutral-950 transition active:bg-neutral-100 disabled:opacity-40"
      >
        {submitting ? "Confirmando…" : "Confirmar retirada"}
      </button>
    </form>
  );
}
