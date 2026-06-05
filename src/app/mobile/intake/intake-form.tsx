"use client";

import { Camera, CheckCircle2, FileImage, Loader2, RotateCcw, Search, Send, Upload } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type ResidentResult = {
  id: string;
  unitId: string;
  name: string;
  phone: string | null;
  isPrimary: boolean;
  buildingLabel: string;
  unitNumber: string;
};

type OcrSuggestion = {
  label: string;
  value: string;
  confidence: "Alta" | "Média" | "Baixa";
};

type CreatedPackage = {
  id: string;
  resident: {
    name: string;
    phone: string | null;
  } | null;
  unit: {
    number: string;
    building: {
      label: string;
    };
  };
};

type CreatePackageResponse = {
  package: CreatedPackage;
  whatsappUrl: string | null;
  whatsappMessage: string;
};

type CameraDiagnostic = {
  secureContext: boolean;
  mediaDevices: boolean;
  getUserMedia: boolean;
  errorName?: string;
  errorMessage?: string;
};

const carrierHints = ["Correios", "Mercado Livre", "Shopee", "Amazon", "Jadlog", "Loggi"];

function confidenceFor(text: string): OcrSuggestion["confidence"] {
  if (text.length > 12) {
    return "Alta";
  }

  if (text.length > 5) {
    return "Média";
  }

  return "Baixa";
}

function extractOcrSuggestions(text: string): OcrSuggestion[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  const suggestions: OcrSuggestion[] = [];
  const tracking = normalized.match(/\b[A-Z]{2}\d{9}[A-Z]{2}\b|\b[A-Z0-9]{10,18}\b/i)?.[0];
  const unit = normalized.match(/\b(?:apto|apartamento|ap|unidade)\s*[:.-]?\s*(\d{2,4})\b/i)?.[1];
  const carrier = carrierHints.find((hint) => normalized.toLowerCase().includes(hint.toLowerCase()));
  const recipient = normalized.match(/\b(?:destinat[aá]rio|recebedor|nome)\s*[:.-]\s*([A-Za-zÀ-ÿ ]{4,40})/i)?.[1]?.trim();

  if (tracking) {
    suggestions.push({ label: "Código", value: tracking.toUpperCase(), confidence: confidenceFor(tracking) });
  }

  if (carrier) {
    suggestions.push({ label: "Transportadora", value: carrier, confidence: "Média" });
  }

  if (unit) {
    suggestions.push({ label: "Apto provável", value: unit, confidence: "Baixa" });
  }

  if (recipient) {
    suggestions.push({ label: "Nome possível", value: recipient, confidence: "Baixa" });
  }

  return suggestions;
}

function cameraErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "A permissão da câmera foi bloqueada. Libere no navegador ou use Anexar para fotografar a etiqueta.";
    }

    if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
      return "Nenhuma câmera compatível foi encontrada. Use Anexar para fotografar ou enviar a etiqueta.";
    }

    if (error.name === "NotReadableError" || error.name === "AbortError") {
      return "A câmera está ocupada por outro aplicativo ou não respondeu. Feche outros apps de câmera e tente novamente.";
    }
  }

  return "Não foi possível abrir a câmera direta. Use Anexar para continuar o cadastro.";
}

export function IntakeForm() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<"idle" | "starting" | "ready" | "error">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraDiagnostic, setCameraDiagnostic] = useState<CameraDiagnostic | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [labelFile, setLabelFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<ResidentResult[]>([]);
  const [selectedResident, setSelectedResident] = useState<ResidentResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [packageCode, setPackageCode] = useState("");
  const [carrier, setCarrier] = useState("");
  const [notes, setNotes] = useState("");
  const [ocrStatus, setOcrStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrSuggestions, setOcrSuggestions] = useState<OcrSuggestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatePackageResponse | null>(null);

  const canSubmit = Boolean(selectedResident) && !isSubmitting;

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (searchTerm.trim().length < 2 || selectedResident) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/residents/search?q=${encodeURIComponent(searchTerm)}`, {
          signal: controller.signal
        });
        const data = (await response.json()) as { residents: ResidentResult[] };
        setResults(data.residents);
      } catch (error) {
        if (!controller.signal.aborted) {
          setFormError("Não foi possível buscar moradores agora. Tente digitar bloco, apto ou telefone.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [searchTerm, selectedResident]);

  const selectedLabel = useMemo(() => {
    if (!selectedResident) {
      return "Nenhum morador selecionado";
    }

    return `${selectedResident.name} · ${selectedResident.buildingLabel} · Apto ${selectedResident.unitNumber}`;
  }, [selectedResident]);

  function setPhoto(file: File) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    stopCameraStream();
    setLabelFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCameraError(null);
    setCameraDiagnostic(null);
    setOcrStatus("idle");
    setOcrSuggestions([]);
    setOcrError(null);
  }

  function clearPhoto() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setLabelFile(null);
    setPreviewUrl(null);
    setOcrStatus("idle");
    setOcrSuggestions([]);
    setOcrError(null);
  }

  function stopCameraStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setVideoReady(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function currentCameraDiagnostic(error?: unknown): CameraDiagnostic {
    return {
      secureContext: window.isSecureContext,
      mediaDevices: Boolean(navigator.mediaDevices),
      getUserMedia: Boolean(navigator.mediaDevices?.getUserMedia),
      ...(error instanceof DOMException
        ? { errorName: error.name, errorMessage: error.message }
        : error instanceof Error
          ? { errorName: error.name, errorMessage: error.message }
        : {})
    };
  }

  async function attachCameraStream(stream: MediaStream) {
    let video = videoRef.current;

    if (!video) {
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      video = videoRef.current;
    }

    if (!video) {
      throw new Error("A prévia de câmera não foi montada.");
    }

    const activeVideo = video;

    activeVideo.srcObject = stream;

    await new Promise<void>((resolve, reject) => {
      if (activeVideo.readyState >= HTMLMediaElement.HAVE_METADATA && activeVideo.videoWidth > 0) {
        resolve();
        return;
      }

      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error("Tempo esgotado ao preparar a câmera."));
      }, 5000);

      function cleanup() {
        window.clearTimeout(timeout);
        activeVideo.removeEventListener("loadedmetadata", handleLoadedMetadata);
        activeVideo.removeEventListener("error", handleError);
      }

      function handleLoadedMetadata() {
        cleanup();
        resolve();
      }

      function handleError() {
        cleanup();
        reject(new Error("O navegador não conseguiu exibir a câmera."));
      }

      activeVideo.addEventListener("loadedmetadata", handleLoadedMetadata);
      activeVideo.addEventListener("error", handleError);
    });

    await activeVideo.play();
    setVideoReady(true);
  }

  async function startCamera() {
    setCameraError(null);
    setCameraDiagnostic(null);
    setVideoReady(false);
    setCameraState("starting");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("error");
      setCameraDiagnostic(currentCameraDiagnostic());
      setCameraError("Este navegador não oferece câmera direta. Use Anexar para fotografar ou enviar a etiqueta.");
      return;
    }

    if (!window.isSecureContext) {
      setCameraState("error");
      setCameraDiagnostic(currentCameraDiagnostic());
      setCameraError("A câmera direta exige HTTPS ou localhost. Em celular via rede local HTTP, use Anexar para continuar.");
      return;
    }

    try {
      stopCameraStream();

      const preferredConstraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      };

      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia(preferredConstraints);
      } catch (firstError) {
        if (
          firstError instanceof DOMException &&
          (firstError.name === "NotAllowedError" || firstError.name === "SecurityError")
        ) {
          throw firstError;
        }

        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      await attachCameraStream(stream);
      setCameraState("ready");
    } catch (error) {
      stopCameraStream();
      setCameraState("error");
      setCameraDiagnostic(currentCameraDiagnostic(error));
      setCameraError(cameraErrorMessage(error));
    }
  }

  async function captureFrame() {
    const video = videoRef.current;

    if (!video || !videoReady || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("A imagem da câmera ainda não está pronta. Aguarde a prévia aparecer ou use Anexar.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Não foi possível capturar a imagem. Use o upload com captura.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.86);
    });

    if (!blob) {
      setCameraError("Não foi possível gerar a foto. Use o upload com captura.");
      return;
    }

    setPhoto(new File([blob], `etiqueta-${Date.now()}.jpg`, { type: "image/jpeg" }));
  }

  async function retakePhoto() {
    clearPhoto();
    await startCamera();
  }

  async function runOcr() {
    if (!labelFile) {
      setOcrError("Capture ou anexe a etiqueta antes de tentar reconhecer dados.");
      return;
    }

    setOcrStatus("running");
    setOcrError(null);

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("por");
      const result = await worker.recognize(labelFile);
      await worker.terminate();
      const suggestions = extractOcrSuggestions(result.data.text);
      setOcrSuggestions(suggestions);
      setOcrStatus("done");

      const code = suggestions.find((suggestion) => suggestion.label === "Código")?.value;
      const carrierSuggestion = suggestions.find((suggestion) => suggestion.label === "Transportadora")?.value;

      if (code && !packageCode) {
        setPackageCode(code);
      }

      if (carrierSuggestion && !carrier) {
        setCarrier(carrierSuggestion);
      }
    } catch (error) {
      setOcrStatus("error");
      setOcrError("OCR indisponível ou inconclusivo. Continue preenchendo manualmente.");
    }
  }

  async function uploadLabelPhoto() {
    if (!labelFile) {
      return null;
    }

    const formData = new FormData();
    formData.append("file", labelFile);
    const response = await fetch("/api/upload/label", {
      method: "POST",
      body: formData
    });
    const data = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !data.url) {
      throw new Error(data.error ?? "Não foi possível salvar a foto da etiqueta.");
    }

    return data.url;
  }

  async function submitPackage() {
    setFormError(null);

    if (!selectedResident) {
      setFormError("Selecione um morador da lista para confirmar bloco e apartamento.");
      return;
    }

    setIsSubmitting(true);

    try {
      const labelPhotoUrl = await uploadLabelPhoto();
      const response = await fetch("/api/packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          residentId: selectedResident.id,
          unitId: selectedResident.unitId,
          labelPhotoUrl: labelPhotoUrl ?? undefined,
          packageCode,
          carrier,
          notes
        })
      });
      const data = (await response.json()) as CreatePackageResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível registrar a encomenda.");
      }

      setCreated(data);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível registrar a encomenda.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function markNotified() {
    if (!created) {
      return;
    }

    await fetch(`/api/packages/${created.package.id}/notify`, {
      method: "POST"
    });
  }

  if (created) {
    return (
      <section className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6 text-white">
        <Link href="/mobile" className="min-h-11 text-sm font-medium text-neutral-300 focus:outline-none focus:ring-2 focus:ring-white">
          Voltar para portaria
        </Link>
        <div className="rounded-[8px] border border-emerald-500/40 bg-emerald-500/10 p-5">
          <CheckCircle2 className="h-8 w-8 text-emerald-300" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold">Encomenda registrada</h1>
          <p className="mt-2 text-sm leading-6 text-emerald-50">
            {created.package.resident?.name ?? "Morador selecionado"} · {created.package.unit.building.label} · Apto {created.package.unit.number}
          </p>
        </div>

        {created.whatsappUrl ? (
          <a
            href={created.whatsappUrl}
            onClick={markNotified}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-16 items-center justify-center gap-3 rounded-[8px] bg-white px-5 py-4 text-lg font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
            Enviar WhatsApp
          </a>
        ) : (
          <div className="rounded-[8px] border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-50">
            Este morador não tem telefone cadastrado. Registre o aviso manualmente.
          </div>
        )}

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-14 rounded-[8px] border border-neutral-600 px-5 py-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-white"
        >
          Nova encomenda
        </button>
        <Link
          href="/mobile/pending"
          className="min-h-14 rounded-[8px] border border-neutral-600 px-5 py-4 text-center text-base font-semibold focus:outline-none focus:ring-2 focus:ring-white"
        >
          Ver pendentes
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6 text-white">
      <Link href="/mobile" className="min-h-11 text-sm font-medium text-neutral-300 focus:outline-none focus:ring-2 focus:ring-white">
        Voltar
      </Link>

      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Portaria</p>
        <h1 className="mt-2 text-3xl font-semibold">Nova encomenda</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-300">
          Capture a etiqueta, confirme o morador e gere o aviso assistido.
        </p>
      </div>

      <div className="rounded-[8px] border border-neutral-700 bg-neutral-900 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Etiqueta</h2>
            <p className="text-sm text-neutral-400">Câmera direta ou captura por arquivo.</p>
          </div>
          <Camera className="h-6 w-6 text-emerald-300" aria-hidden="true" />
        </div>

        {cameraState === "ready" || cameraState === "starting" ? (
          <div className="mt-4 overflow-hidden rounded-[8px] border border-neutral-700 bg-black">
            <video ref={videoRef} className="aspect-[4/3] w-full object-cover" autoPlay playsInline muted />
          </div>
        ) : previewUrl ? (
          <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-[8px] border border-neutral-700 bg-neutral-950">
            <img src={previewUrl} alt="Prévia da etiqueta capturada" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="mt-4 flex aspect-[4/3] items-center justify-center rounded-[8px] border border-dashed border-neutral-600 bg-neutral-950 text-center text-sm text-neutral-400">
            Nenhuma etiqueta capturada
          </div>
        )}

        {cameraError ? (
          <div className="mt-3 rounded-[8px] border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-50">
            <p>{cameraError}</p>
            {cameraDiagnostic ? (
              <dl className="mt-3 grid gap-1 text-xs text-amber-100/80">
                <div className="flex justify-between gap-3">
                  <dt>HTTPS seguro</dt>
                  <dd>{cameraDiagnostic.secureContext ? "sim" : "não"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>MediaDevices</dt>
                  <dd>{cameraDiagnostic.mediaDevices ? "sim" : "não"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>getUserMedia</dt>
                  <dd>{cameraDiagnostic.getUserMedia ? "sim" : "não"}</dd>
                </div>
                {cameraDiagnostic.errorName ? (
                  <div className="flex justify-between gap-3">
                    <dt>Erro do navegador</dt>
                    <dd>{cameraDiagnostic.errorName}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={startCamera}
            disabled={cameraState === "starting"}
            className="flex min-h-14 items-center justify-center gap-2 rounded-[8px] bg-white px-4 py-3 font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-70"
          >
            {cameraState === "starting" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Camera className="h-5 w-5" aria-hidden="true" />}
            Câmera
          </button>

          <label className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-neutral-600 px-4 py-3 font-semibold focus-within:outline-none focus-within:ring-2 focus-within:ring-white">
            <Upload className="h-5 w-5" aria-hidden="true" />
            Anexar
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              capture="environment"
              className="sr-only"
              aria-label="Fotografar ou anexar etiqueta"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setPhoto(file);
                }
              }}
            />
          </label>
        </div>

        {cameraState === "ready" ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={captureFrame}
              disabled={!videoReady}
              className="flex min-h-14 items-center justify-center gap-2 rounded-[8px] bg-emerald-400 px-4 py-3 font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <FileImage className="h-5 w-5" aria-hidden="true" />
              Capturar
            </button>
            <button
              type="button"
              onClick={startCamera}
              className="flex min-h-14 items-center justify-center gap-2 rounded-[8px] border border-neutral-600 px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-white"
            >
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
              Retomar
            </button>
          </div>
        ) : null}
        {previewUrl ? (
          <button
            type="button"
            onClick={retakePhoto}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] border border-neutral-600 px-4 py-3 text-sm font-semibold text-neutral-100 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            Refazer foto
          </button>
        ) : null}
      </div>

      <div className="rounded-[8px] border border-neutral-700 bg-neutral-900 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Reconhecimento</h2>
            <p className="text-sm text-neutral-400">Sugestões editáveis, sem bloquear cadastro.</p>
          </div>
          <button
            type="button"
            onClick={runOcr}
            disabled={!labelFile || ocrStatus === "running"}
            className="min-h-11 rounded-[8px] border border-neutral-600 px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
          >
            {ocrStatus === "running" ? "Lendo" : "Ler etiqueta"}
          </button>
        </div>
        {ocrError ? <p className="mt-3 text-sm text-amber-200">{ocrError}</p> : null}
        {ocrSuggestions.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {ocrSuggestions.map((suggestion) => (
              <button
                key={`${suggestion.label}-${suggestion.value}`}
                type="button"
                onClick={() => {
                  if (suggestion.label === "Código") {
                    setPackageCode(suggestion.value);
                  }
                  if (suggestion.label === "Transportadora") {
                    setCarrier(suggestion.value);
                  }
                  if (suggestion.label === "Apto provável") {
                    setSearchTerm(suggestion.value);
                    setSelectedResident(null);
                  }
                }}
                className="flex min-h-12 items-center justify-between rounded-[8px] border border-neutral-700 px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span>
                  <span className="text-neutral-400">{suggestion.label}: </span>
                  {suggestion.value}
                </span>
                <span className="rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-300">{suggestion.confidence}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">Sem sugestões aplicadas.</p>
        )}
      </div>

      <div className="rounded-[8px] border border-neutral-700 bg-neutral-900 p-4">
        <label htmlFor="resident-search" className="text-lg font-semibold">
          Morador
        </label>
        <div className="mt-3 flex min-h-14 items-center gap-2 rounded-[8px] border border-neutral-600 bg-neutral-950 px-3 focus-within:ring-2 focus-within:ring-white">
          <Search className="h-5 w-5 text-neutral-500" aria-hidden="true" />
          <input
            id="resident-search"
            value={selectedResident ? selectedLabel : searchTerm}
            onChange={(event) => {
              setSelectedResident(null);
              setSearchTerm(event.target.value);
            }}
            placeholder="Nome, bloco, apto ou telefone"
            className="min-h-12 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-500"
            autoComplete="off"
          />
        </div>

        {isSearching ? <p className="mt-3 text-sm text-neutral-400">Buscando moradores...</p> : null}

        {results.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {results.map((resident) => (
              <button
                key={resident.id}
                type="button"
                onClick={() => {
                  setSelectedResident(resident);
                  setSearchTerm("");
                  setResults([]);
                }}
                className="min-h-20 rounded-[8px] border border-neutral-700 bg-neutral-950 p-3 text-left focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">Morador: {resident.name}</p>
                    <p className="mt-1 text-sm text-neutral-300">
                      Bloco: {resident.buildingLabel} · Apto: {resident.unitNumber}
                    </p>
                    <p className="mt-1 text-sm text-neutral-400">Telefone: {resident.phone ?? "Não informado"}</p>
                  </div>
                  {resident.isPrimary ? (
                    <span className="rounded-full bg-emerald-400 px-2 py-1 text-xs font-semibold text-neutral-950">Principal</span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3">
        <label className="grid gap-2 text-sm font-semibold text-neutral-200">
          Código da encomenda
          <input
            value={packageCode}
            onChange={(event) => setPackageCode(event.target.value)}
            className="min-h-12 rounded-[8px] border border-neutral-700 bg-neutral-900 px-3 text-base font-normal outline-none focus:ring-2 focus:ring-white"
            placeholder="Opcional"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-200">
          Transportadora
          <input
            value={carrier}
            onChange={(event) => setCarrier(event.target.value)}
            className="min-h-12 rounded-[8px] border border-neutral-700 bg-neutral-900 px-3 text-base font-normal outline-none focus:ring-2 focus:ring-white"
            placeholder="Opcional"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-200">
          Observação
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-24 rounded-[8px] border border-neutral-700 bg-neutral-900 px-3 py-3 text-base font-normal outline-none focus:ring-2 focus:ring-white"
            placeholder="Ex.: pacote grande, frágil, prateleira"
          />
        </label>
      </div>

      {formError ? (
        <p className="rounded-[8px] border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-50">{formError}</p>
      ) : null}

      <button
        type="button"
        onClick={submitPackage}
        disabled={!canSubmit}
        className="flex min-h-16 items-center justify-center gap-3 rounded-[8px] bg-white px-5 py-4 text-lg font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
        Registrar encomenda
      </button>
    </section>
  );
}
