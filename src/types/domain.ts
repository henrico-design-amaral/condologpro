export type RoleCode = 'admin' | 'front_desk' | 'manager';

export type PackageStatus =
  | 'awaiting_identification'
  | 'awaiting_notification'
  | 'awaiting_pickup'
  | 'picked_up'
  | 'returned'
  | 'cancelled'
  | 'problem';

export type PickupRelation = 'resident' | 'family' | 'employee' | 'authorized_person' | 'other';

export interface Condominium {
  id: string;
  name: string;
  slug: string;
  whatsapp_phone: string | null;
  retention_days: number;
}

export interface SessionContext {
  userId: string;
  email: string;
  fullName: string;
  condominium: Condominium;
  membershipId: string;
  roles: RoleCode[];
}

export interface UnitOption {
  id: string;
  number: string;
  label: string | null;
  block_id: string;
  blocks: { code: string; label: string } | null;
}

export interface ResidentResult {
  resident_id: string;
  full_name: string;
  phone_last4: string | null;
  unit_id: string;
  unit_number: string;
  block_code: string;
  block_label: string;
  is_primary: boolean;
}

export interface PackageSummary {
  id: string;
  recipient_name: string;
  tracking_code: string | null;
  carrier_name: string | null;
  status: PackageStatus;
  received_at: string;
  notified_at: string | null;
  picked_up_at: string | null;
  version: number;
  notes: string | null;
  unit_id: string | null;
  resident_id: string | null;
  units: {
    number: string;
    label: string | null;
    blocks: { code: string; label: string } | null;
  } | null;
  residents: { full_name: string; phone: string | null } | null;
}

export interface PackageEvidence {
  images: {
    id: string;
    kind: string;
    storage_object_path: string;
    created_at: string;
    signed_url?: string;
  }[];
  recognition: {
    id: string;
    engine: string;
    extracted_fields: Record<string, unknown>;
    corrected_fields: Record<string, unknown>;
    confidence: Record<string, unknown>;
    raw_text: string | null;
    was_skipped: boolean;
    created_at: string;
  }[];
  notifications: {
    id: string;
    status: string;
    rendered_message: string;
    phone_last4: string | null;
    opened_at: string | null;
    confirmed_at: string | null;
    created_at: string;
  }[];
  pickups: {
    id: string;
    picked_up_by_name: string;
    relation: string;
    document_last4: string | null;
    proof_storage_path: string | null;
    proof_signed_url?: string;
    notes: string | null;
    picked_up_at: string;
    voided_at: string | null;
  }[];
  history: {
    id: string;
    from_status: PackageStatus | null;
    to_status: PackageStatus;
    reason: string | null;
    created_at: string;
  }[];
}

export interface DashboardStats {
  received_today: number;
  awaiting_identification: number;
  awaiting_notification: number;
  awaiting_pickup: number;
  picked_up_today: number;
  old_packages: number;
  problems: number;
}

export interface RecognitionFields {
  recipientName: string;
  block: string;
  unit: string;
  trackingCode: string;
  carrier: string;
}

export interface RecognitionResult {
  fields: RecognitionFields;
  confidence: number;
  rawText: string;
  lowConfidence: boolean;
}

export interface IntakeDraft {
  id: string;
  clientRequestId: string;
  recipientName: string;
  trackingCode: string;
  carrierName: string;
  volumeType: 'envelope' | 'package' | 'box' | 'large_volume' | 'other';
  quantity: number;
  notes: string;
  unitId: string;
  residentId: string;
  duplicateOverrideReason: string;
  recognition: RecognitionResult | null;
}
