"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Building = { label: string };
type Unit = { id: string; number: string; building: Building };
type Resident = { id: string; name: string; unitId: string; unit: Unit };

type Props = {
  residents: Resident[];
};

const CARRIERS = [
  "Mercado Livre",
  "Shopee",
  "Amazon",
  "Correios",
  "TikTok Shop",
  "Transportadora",
  "Outro"
];

export function IntakeForm({ residents }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [residentId, setResidentId] = useState("");
  const [carrier, setCarrier] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group residents by building label
  const grouped = residents.reduce<Record<string, Resident[]>>((acc, r) => {
    const key = r.unit.building.label;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erro ao enviar foto.");
      }
      const data = (await res.json()) as { url: string };
      setPhotoUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro ao enviar foto.");
      setPhotoPreview(null);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!residentId) return;

    const resident = residents.find((r) => r.id === residentId);
    if (!resident) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: resident.unitId,
          residentId,
          carrier: carrier || undefined,
          labelPhotoUrl: photoUrl || undefined,
          notes: notes.trim() || undefined
        })
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erro ao registrar encomenda.");
      }

      const pkg = (await res.json()) as { id: string };
      router.push(`/mobile/package/${pkg.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar encomenda.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
      {/* Label photo */}
      <div>
        <p className="mb-2 text-sm font-medium text-neutral-400">
          Foto da etiqueta
          <span className="ml-1 text-neutral-600">(opcional)</span>
        </p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 px-4 py-6 text-sm text-neutral-500 transition active:border-neutral-600 active:bg-neutral-900"
        >
          {uploading
            ? "Enviando foto…"
            : photoUrl
              ? "✓ Foto anexada — toque para trocar"
              : "Toque para fotografar a etiqueta"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        {uploadError && (
          <p className="mt-1.5 text-xs text-red-400">{uploadError}</p>
        )}
        {photoPreview && !uploading && (
          <img
            src={photoPreview}
            alt="Etiqueta"
            className="mt-3 max-h-40 w-full rounded-xl object-cover"
          />
        )}
      </div>

      {/* Resident selector */}
      <div>
        <label
          htmlFor="resident"
          className="mb-2 block text-sm font-medium text-neutral-400"
        >
          Morador <span className="text-white">*</span>
        </label>
        <select
          id="resident"
          required
          value={residentId}
          onChange={(e) => setResidentId(e.target.value)}
          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-4 text-base text-white focus:border-neutral-500 focus:outline-none"
        >
          <option value="">Selecione o morador</option>
          {Object.entries(grouped).map(([building, bResidents]) => (
            <optgroup key={building} label={building}>
              {bResidents.map((r) => (
                <option key={r.id} value={r.id}>
                  Apto {r.unit.number} — {r.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Carrier */}
      <div>
        <label
          htmlFor="carrier"
          className="mb-2 block text-sm font-medium text-neutral-400"
        >
          Transportadora
          <span className="ml-1 text-neutral-600">(opcional)</span>
        </label>
        <select
          id="carrier"
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-4 text-base text-white focus:border-neutral-500 focus:outline-none"
        >
          <option value="">Selecione</option>
          {CARRIERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-medium text-neutral-400"
        >
          Observações
          <span className="ml-1 text-neutral-600">(opcional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Pacote grande, frágil, volume extra…"
          rows={3}
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
        disabled={submitting || !residentId || uploading}
        className="w-full rounded-2xl bg-white py-5 text-lg font-semibold text-neutral-950 transition active:bg-neutral-100 disabled:opacity-40"
      >
        {submitting ? "Registrando…" : "Registrar encomenda"}
      </button>
    </form>
  );
}
