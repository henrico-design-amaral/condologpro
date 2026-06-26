import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import {
  buildLabelStoragePath,
  hasExpectedImageSignature,
  joinSignedStorageUrl,
  resolveStorageMode
} from "@/lib/storage-policy";

const MAX_LABEL_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_LABEL_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DEFAULT_SIGNED_URL_TTL_SECONDS = 60;
const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), ".local-data", "uploads");

const contentTypeByExtension: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

export type StoredLabelPhoto = {
  mode: "local" | "supabase-private";
  path: string;
  bucket: string | null;
};

export type StorageMode = "local" | "supabase-private" | "misconfigured";

export type SupabaseStorageConfig = {
  url: string;
  bucket: string;
  serviceKey: string;
};

export class StorageConfigurationError extends Error {
  constructor() {
    super("Supabase Storage está parcialmente configurado. Corrija as variáveis do ambiente.");
    this.name = "StorageConfigurationError";
  }
}

export function validateLabelPhoto(file: File) {
  if (!ALLOWED_LABEL_PHOTO_TYPES.has(file.type)) {
    throw new Error("Use uma imagem JPG, PNG ou WebP para a etiqueta.");
  }

  if (file.size > MAX_LABEL_PHOTO_BYTES) {
    throw new Error("A imagem da etiqueta deve ter no máximo 8 MB.");
  }
}

function buildSafeLabelPath(file: File, organizationId: string) {
  return buildLabelStoragePath({
    organizationId,
    mimeType: file.type,
    date: new Date().toISOString().slice(0, 10),
    id: randomUUID()
  });
}

function storageEnvironment() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
    bucket: process.env.SUPABASE_STORAGE_BUCKET?.trim(),
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  };
}

export function getSupabaseStorageConfig(): SupabaseStorageConfig | null {
  const config = storageEnvironment();
  const mode = resolveStorageMode(config);

  if (mode === "local") {
    return null;
  }

  if (mode === "misconfigured") {
    throw new StorageConfigurationError();
  }

  return {
    url: config.url!.replace(/\/$/, ""),
    bucket: config.bucket!,
    serviceKey: config.serviceKey!
  };
}

export function detectStorageMode(): StorageMode {
  try {
    return getSupabaseStorageConfig() ? "supabase-private" : "local";
  } catch (error) {
    if (error instanceof StorageConfigurationError) {
      return "misconfigured";
    }

    throw error;
  }
}

function localFilePath(storagePath: string) {
  const resolved = path.resolve(LOCAL_UPLOAD_ROOT, storagePath);
  const root = path.resolve(LOCAL_UPLOAD_ROOT) + path.sep;

  if (!resolved.startsWith(root)) {
    throw new Error("Caminho de etiqueta inválido.");
  }

  return resolved;
}

export async function storeLabelPhoto(
  file: File,
  organizationId: string
): Promise<StoredLabelPhoto> {
  validateLabelPhoto(file);

  const storagePath = buildSafeLabelPath(file, organizationId);
  const bytes = Buffer.from(await file.arrayBuffer());

  if (!hasExpectedImageSignature(bytes, file.type)) {
    throw new Error("O conteúdo do arquivo não corresponde a uma imagem permitida.");
  }

  const supabase = getSupabaseStorageConfig();

  if (supabase) {
    const uploadUrl = `${supabase.url}/storage/v1/object/${supabase.bucket}/${storagePath}`;
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: supabase.serviceKey,
        Authorization: `Bearer ${supabase.serviceKey}`,
        "Content-Type": file.type,
        "Cache-Control": "3600",
        "x-upsert": "false"
      },
      body: bytes
    });

    if (!response.ok) {
      throw new Error("Falha ao enviar etiqueta para o Storage privado.");
    }

    return {
      mode: "supabase-private",
      path: storagePath,
      bucket: supabase.bucket
    };
  }

  const target = localFilePath(storagePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);

  return {
    mode: "local",
    path: storagePath,
    bucket: null
  };
}

export async function readLocalLabelPhoto(storagePath: string) {
  const filePath = localFilePath(storagePath);
  const body = await readFile(filePath);
  const contentType = contentTypeByExtension[path.extname(filePath).toLowerCase()];

  if (!contentType) {
    throw new Error("Tipo de etiqueta armazenada inválido.");
  }

  return { body, contentType };
}

export async function createSignedLabelUrl(
  storagePath: string,
  ttlSeconds: number = DEFAULT_SIGNED_URL_TTL_SECONDS
): Promise<string | null> {
  const supabase = getSupabaseStorageConfig();

  if (!supabase) {
    return null;
  }

  const signUrl = `${supabase.url}/storage/v1/object/sign/${supabase.bucket}/${storagePath}`;
  const response = await fetch(signUrl, {
    method: "POST",
    headers: {
      apikey: supabase.serviceKey,
      Authorization: `Bearer ${supabase.serviceKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ expiresIn: ttlSeconds })
  });

  if (!response.ok) {
    throw new Error("Falha ao gerar acesso temporário para a etiqueta.");
  }

  const data = (await response.json()) as { signedURL?: string };

  if (!data.signedURL) {
    throw new Error("Storage não retornou uma URL temporária.");
  }

  return joinSignedStorageUrl(supabase.url, data.signedURL);
}
