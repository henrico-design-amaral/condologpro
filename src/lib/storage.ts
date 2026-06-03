import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_LABEL_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_LABEL_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 10;

const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export type StoredLabelPhoto = {
  url: string;
  mode: "local" | "supabase-public" | "supabase-signed";
  path: string;
  bucket: string | null;
};

export type StorageMode = "local" | "supabase-public" | "supabase-private" | "unknown";

export type SupabaseStorageConfig = {
  url: string;
  bucket: string;
  serviceKey: string;
  publicBase: string;
};

export function validateLabelPhoto(file: File) {
  if (!ALLOWED_LABEL_PHOTO_TYPES.has(file.type)) {
    throw new Error("Use uma imagem JPG, PNG ou WebP para a etiqueta.");
  }

  if (file.size > MAX_LABEL_PHOTO_BYTES) {
    throw new Error("A imagem da etiqueta deve ter no máximo 8 MB.");
  }
}

function buildSafeLabelPath(file: File) {
  const extension = extensionByType[file.type] ?? "jpg";
  const date = new Date().toISOString().slice(0, 10);
  return `labels/${date}/${randomUUID()}.${extension}`;
}

export function getSupabaseStorageConfig(): SupabaseStorageConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !bucket || !key) {
    return null;
  }

  const trimmedUrl = url.replace(/\/$/, "");

  return {
    url: trimmedUrl,
    bucket,
    serviceKey: key,
    publicBase: `${trimmedUrl}/storage/v1/object/public/${bucket}`
  };
}

export function detectStorageMode(): StorageMode {
  const config = getSupabaseStorageConfig();

  if (!config) {
    return "local";
  }

  const policyFlag = process.env.SUPABASE_STORAGE_PUBLIC?.toLowerCase();

  if (policyFlag === "true" || policyFlag === "1") {
    return "supabase-public";
  }

  if (policyFlag === "false" || policyFlag === "0") {
    return "supabase-private";
  }

  return "unknown";
}

export async function storeLabelPhoto(file: File): Promise<StoredLabelPhoto> {
  validateLabelPhoto(file);

  const storagePath = buildSafeLabelPath(file);
  const bytes = Buffer.from(await file.arrayBuffer());
  const supabase = getSupabaseStorageConfig();

  if (supabase) {
    const uploadUrl = `${supabase.url}/storage/v1/object/${supabase.bucket}/${storagePath}`;
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${supabase.serviceKey}`,
        "Content-Type": file.type,
        "Cache-Control": "31536000"
      },
      body: bytes
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Falha ao enviar etiqueta para o Supabase Storage. ${detail}`);
    }

    return {
      mode: "supabase-public",
      path: storagePath,
      bucket: supabase.bucket,
      url: `${supabase.publicBase}/${storagePath}`
    };
  }

  const localPath = path.join(process.cwd(), "public", "uploads", storagePath);
  await mkdir(path.dirname(localPath), { recursive: true });
  await writeFile(localPath, bytes);

  return {
    mode: "local",
    path: storagePath,
    bucket: null,
    url: `/uploads/${storagePath}`
  };
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
      Authorization: `Bearer ${supabase.serviceKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ expiresIn: ttlSeconds })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Falha ao assinar URL do Supabase Storage. ${detail}`);
  }

  const data = (await response.json()) as { signedURL?: string };

  if (!data.signedURL) {
    return null;
  }

  return `${supabase.url}/storage/v1${data.signedURL}`;
}
