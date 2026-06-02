import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_LABEL_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_LABEL_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export type StoredLabelPhoto = {
  url: string;
  mode: "local" | "supabase";
  path: string;
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

function getSupabaseStorageConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !bucket || !key) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ""),
    bucket,
    key
  };
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
        Authorization: `Bearer ${supabase.key}`,
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
      mode: "supabase",
      path: storagePath,
      url: `${supabase.url}/storage/v1/object/public/${supabase.bucket}/${storagePath}`
    };
  }

  const localPath = path.join(process.cwd(), "public", "uploads", storagePath);
  await mkdir(path.dirname(localPath), { recursive: true });
  await writeFile(localPath, bytes);

  return {
    mode: "local",
    path: storagePath,
    url: `/uploads/${storagePath}`
  };
}
