const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export function organizationStoragePrefix(organizationId: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(organizationId)) {
    throw new Error("Identificador de organização inválido para armazenamento.");
  }

  return `organizations/${organizationId}/labels/`;
}

export function buildLabelStoragePath(input: {
  organizationId: string;
  mimeType: string;
  date: string;
  id: string;
}) {
  const extension = extensionByType[input.mimeType];

  if (!extension) {
    throw new Error("Tipo de etiqueta armazenada inválido.");
  }

  return `${organizationStoragePrefix(input.organizationId)}${input.date}/${input.id}.${extension}`;
}

export function isOrganizationLabelPath(storagePath: string, organizationId: string) {
  return storagePath.startsWith(organizationStoragePrefix(organizationId));
}

export function resolveStorageMode(config: {
  url?: string;
  bucket?: string;
  serviceKey?: string;
}) {
  const configuredCount = [config.url, config.bucket, config.serviceKey].filter(Boolean).length;

  if (configuredCount === 0) {
    return "local" as const;
  }

  if (configuredCount !== 3) {
    return "misconfigured" as const;
  }

  return "supabase-private" as const;
}

export function joinSignedStorageUrl(supabaseUrl: string, signedPath: string) {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1${signedPath}`;
}

export function hasExpectedImageSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((value, index) => bytes[index] === value);
  }

  if (mimeType === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  return false;
}
