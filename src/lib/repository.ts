import type { SupabaseClient, User } from '@supabase/supabase-js';
import type {
  DashboardStats,
  IntakeDraft,
  PackageStatus,
  PackageEvidence,
  PackageSummary,
  ResidentResult,
  RoleCode,
  SessionContext,
  UnitOption
} from '../types/domain';
import type { PreparedImage } from './image';

function throwIf(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function nullableText(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

export async function loadSessionContext(
  client: SupabaseClient,
  user: User
): Promise<SessionContext> {
  const profileResult = await client
    .from('profiles')
    .select('full_name,is_active')
    .eq('id', user.id)
    .maybeSingle();
  throwIf(profileResult.error);
  if (!profileResult.data?.is_active) throw new Error('INACTIVE_USER');

  const membershipResult = await client
    .from('user_condominiums')
    .select(
      'id,condominium_id,condominiums(id,name,slug,whatsapp_phone,retention_days),user_roles(roles(code))'
    )
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();
  throwIf(membershipResult.error);
  if (!membershipResult.data) throw new Error('NO_ACTIVE_CONDOMINIUM');

  const membership = membershipResult.data as unknown as {
    id: string;
    condominiums: SessionContext['condominium'];
    user_roles: { roles: { code: RoleCode } | null }[];
  };
  return {
    userId: user.id,
    email: user.email ?? '',
    fullName: String(profileResult.data.full_name),
    condominium: membership.condominiums,
    membershipId: membership.id,
    roles: membership.user_roles.flatMap((item) => (item.roles?.code ? [item.roles.code] : []))
  };
}

export async function loadDashboard(
  client: SupabaseClient,
  condominiumId: string
): Promise<DashboardStats> {
  const result = await client.rpc('get_dashboard_stats', { p_condominium_id: condominiumId });
  throwIf(result.error);
  return result.data as DashboardStats;
}

export async function listPackages(
  client: SupabaseClient,
  condominiumId: string,
  options: {
    query?: string;
    status?: PackageStatus | '';
    from?: string;
    to?: string;
    oldOnly?: boolean;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ rows: PackageSummary[]; count: number }> {
  const page = options.page ?? 0;
  const pageSize = options.pageSize ?? 25;
  const result = await client.rpc('search_packages', {
    p_condominium_id: condominiumId,
    p_query: options.query?.trim() || null,
    p_status: options.status || null,
    p_from: options.from ? new Date(`${options.from}T00:00:00-03:00`).toISOString() : null,
    p_to: options.to ? new Date(`${options.to}T23:59:59.999-03:00`).toISOString() : null,
    p_old_only: options.oldOnly ?? false,
    p_limit: pageSize,
    p_offset: page * pageSize
  });
  throwIf(result.error);
  const data = (result.data ?? []) as Record<string, unknown>[];
  const rows = data.map((row) => ({
    id: textValue(row.id),
    recipient_name: textValue(row.recipient_name),
    tracking_code: nullableText(row.tracking_code),
    carrier_name: nullableText(row.carrier_name),
    status: row.status as PackageStatus,
    received_at: textValue(row.received_at),
    notified_at: nullableText(row.notified_at),
    picked_up_at: nullableText(row.picked_up_at),
    version: Number(row.version),
    notes: nullableText(row.notes),
    unit_id: nullableText(row.unit_id),
    resident_id: nullableText(row.resident_id),
    units: row.unit_id
      ? {
          number: textValue(row.unit_number),
          label: nullableText(row.unit_label),
          blocks: row.block_code
            ? { code: textValue(row.block_code), label: textValue(row.block_label) }
            : null
        }
      : null,
    residents: row.resident_id
      ? {
          full_name: textValue(row.resident_full_name),
          phone: nullableText(row.resident_phone)
        }
      : null
  }));
  return { rows, count: Number(data[0]?.total_count ?? 0) };
}

export async function searchResidents(
  client: SupabaseClient,
  condominiumId: string,
  query: string
): Promise<ResidentResult[]> {
  const result = await client.rpc('search_residents', {
    p_condominium_id: condominiumId,
    p_query: query,
    p_limit: 20
  });
  throwIf(result.error);
  return (result.data ?? []) as ResidentResult[];
}

export async function searchUnits(
  client: SupabaseClient,
  condominiumId: string,
  query: string
): Promise<UnitOption[]> {
  const safe = query.replace(/[%_,()]/g, ' ').trim();
  let request = client
    .from('units')
    .select('id,number,label,block_id,blocks!inner(code,label)')
    .eq('condominium_id', condominiumId)
    .eq('is_active', true)
    .order('number')
    .limit(30);
  if (safe) request = request.or(`number.ilike.%${safe}%,label.ilike.%${safe}%`);
  const result = await request;
  throwIf(result.error);
  return (result.data ?? []) as unknown as UnitOption[];
}

export async function findDuplicates(
  client: SupabaseClient,
  condominiumId: string,
  draft: IntakeDraft
) {
  const result = await client.rpc('find_package_duplicates', {
    p_condominium_id: condominiumId,
    p_tracking_code: draft.trackingCode || null,
    p_unit_id: draft.unitId || null,
    p_resident_id: draft.residentId || null,
    p_recipient_name: draft.recipientName
  });
  throwIf(result.error);
  return (result.data ?? []) as {
    id: string;
    recipient_name: string;
    tracking_code: string | null;
    duplicate_score: number;
    duplicate_reasons: string[];
  }[];
}

export async function createIntake(
  client: SupabaseClient,
  condominiumId: string,
  draft: IntakeDraft,
  preparedImage: PreparedImage | null
): Promise<string> {
  const images: Record<string, unknown>[] = [];
  const uploadedPaths: string[] = [];
  if (preparedImage) {
    const extension =
      preparedImage.originalFile.type === 'image/png'
        ? 'png'
        : preparedImage.originalFile.type === 'image/webp'
          ? 'webp'
          : 'jpg';
    const originalPath = `${condominiumId}/${draft.id}/label-original-${crypto.randomUUID()}.${extension}`;
    const thumbnailPath = `${condominiumId}/${draft.id}/label-thumbnail-${crypto.randomUUID()}.webp`;
    const upload = await client.storage
      .from('package-evidence')
      .upload(originalPath, preparedImage.originalFile, {
        contentType: preparedImage.originalFile.type,
        upsert: false,
        cacheControl: '31536000'
      });
    throwIf(upload.error);
    uploadedPaths.push(originalPath);
    const thumbnailUpload = await client.storage
      .from('package-evidence')
      .upload(thumbnailPath, preparedImage.file, {
        contentType: preparedImage.file.type,
        upsert: false,
        cacheControl: '31536000'
      });
    if (thumbnailUpload.error) {
      await client.storage.from('package-evidence').remove(uploadedPaths);
      throw new Error(thumbnailUpload.error.message);
    }
    uploadedPaths.push(thumbnailPath);
    images.push({
      kind: 'label_original',
      storage_object_path: originalPath,
      mime_type: preparedImage.originalFile.type,
      size_bytes: preparedImage.originalFile.size,
      width: preparedImage.width,
      height: preparedImage.height,
      sha256: preparedImage.sha256
    });
    images.push({
      kind: 'label_thumbnail',
      storage_object_path: thumbnailPath,
      mime_type: preparedImage.file.type,
      size_bytes: preparedImage.file.size,
      width: preparedImage.width,
      height: preparedImage.height
    });
  }

  const recognition = draft.recognition
    ? {
        engine: 'tesseract.js',
        engine_version: '7',
        extracted_fields: draft.recognition.fields,
        corrected_fields: {
          recipient_name: draft.recipientName,
          tracking_code: draft.trackingCode,
          carrier_name: draft.carrierName
        },
        confidence: { overall: draft.recognition.confidence },
        raw_text: draft.recognition.rawText,
        was_skipped: false
      }
    : { engine: 'manual', was_skipped: true };

  const result = await client.rpc('create_package_intake', {
    p_payload: {
      id: draft.id,
      condominium_id: condominiumId,
      client_request_id: draft.clientRequestId,
      unit_id: draft.unitId || null,
      resident_id: draft.residentId || null,
      recipient_name: draft.recipientName,
      tracking_code: draft.trackingCode || null,
      carrier_name: draft.carrierName || null,
      volume_type: draft.volumeType,
      quantity: draft.quantity,
      notes: draft.notes || null,
      duplicate_override_reason: draft.duplicateOverrideReason || null,
      images,
      recognition
    }
  });
  if (result.error) {
    if (uploadedPaths.length) await client.storage.from('package-evidence').remove(uploadedPaths);
    throw new Error(result.error.message);
  }
  return String(result.data);
}

export async function confirmNotification(
  client: SupabaseClient,
  packageId: string,
  message: string,
  phoneLast4: string | null
): Promise<void> {
  const result = await client.rpc('record_package_notification', {
    p_package_id: packageId,
    p_rendered_message: message,
    p_phone_last4: phoneLast4,
    p_template_id: null,
    p_opened_at: new Date().toISOString()
  });
  throwIf(result.error);
}

export async function completePickup(
  client: SupabaseClient,
  condominiumId: string,
  packageId: string,
  version: number,
  values: {
    name: string;
    relation: string;
    documentLast4: string;
    notes: string;
    proofPath?: string | null;
  },
  proofImage: PreparedImage | null = null
): Promise<void> {
  let uploadedProofPath: string | null = null;
  if (proofImage) {
    const extension =
      proofImage.originalFile.type === 'image/png'
        ? 'png'
        : proofImage.originalFile.type === 'image/webp'
          ? 'webp'
          : 'jpg';
    uploadedProofPath = `${condominiumId}/${packageId}/pickup-${crypto.randomUUID()}.${extension}`;
    const upload = await client.storage
      .from('package-evidence')
      .upload(uploadedProofPath, proofImage.originalFile, {
        contentType: proofImage.originalFile.type,
        upsert: false,
        cacheControl: '31536000'
      });
    throwIf(upload.error);
  }
  const result = await client.rpc('complete_package_pickup', {
    p_package_id: packageId,
    p_expected_version: version,
    p_picked_up_by_name: values.name,
    p_relation: values.relation,
    p_document_last4: values.documentLast4 || null,
    p_proof_storage_path: uploadedProofPath ?? values.proofPath ?? null,
    p_notes: values.notes || null
  });
  if (result.error) {
    if (uploadedProofPath)
      await client.storage.from('package-evidence').remove([uploadedProofPath]);
    throw new Error(result.error.message);
  }
}

export async function createSignedImageUrl(client: SupabaseClient, path: string): Promise<string> {
  const result = await client.storage.from('package-evidence').createSignedUrl(path, 300);
  throwIf(result.error);
  return result.data?.signedUrl ?? '';
}

export async function loadPackageEvidence(
  client: SupabaseClient,
  packageId: string
): Promise<PackageEvidence> {
  const [images, recognition, notifications, pickups, history] = await Promise.all([
    client
      .from('package_images')
      .select('id,kind,storage_object_path,created_at')
      .eq('package_id', packageId)
      .order('created_at'),
    client
      .from('package_recognition_results')
      .select(
        'id,engine,extracted_fields,corrected_fields,confidence,raw_text,was_skipped,created_at'
      )
      .eq('package_id', packageId)
      .order('created_at', { ascending: false }),
    client
      .from('package_notifications')
      .select('id,status,rendered_message,phone_last4,opened_at,confirmed_at,created_at')
      .eq('package_id', packageId)
      .order('created_at', { ascending: false }),
    client
      .from('package_pickups')
      .select(
        'id,picked_up_by_name,relation,document_last4,proof_storage_path,notes,picked_up_at,voided_at'
      )
      .eq('package_id', packageId)
      .order('created_at', { ascending: false }),
    client
      .from('package_status_history')
      .select('id,from_status,to_status,reason,created_at')
      .eq('package_id', packageId)
      .order('created_at')
  ]);
  for (const result of [images, recognition, notifications, pickups, history])
    throwIf(result.error);
  const protectedImages = await Promise.all(
    (images.data ?? []).map(async (image) => ({
      ...image,
      signed_url: await createSignedImageUrl(client, String(image.storage_object_path))
    }))
  );
  const protectedPickups = await Promise.all(
    (pickups.data ?? []).map(async (pickup) => ({
      ...pickup,
      ...(pickup.proof_storage_path
        ? {
            proof_signed_url: await createSignedImageUrl(client, String(pickup.proof_storage_path))
          }
        : {})
    }))
  );
  return {
    images: protectedImages,
    recognition: recognition.data ?? [],
    notifications: notifications.data ?? [],
    pickups: protectedPickups,
    history: history.data ?? []
  };
}
