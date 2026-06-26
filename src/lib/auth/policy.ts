export type OperationalRole = "ADMIN" | "FRONT_DESK" | "MANAGER";

export const ADMIN_ROLES: readonly OperationalRole[] = ["ADMIN", "MANAGER"];
export const OPERATOR_ADMIN_ROLES: readonly OperationalRole[] = ["ADMIN"];
export const OPERATIONAL_ROLES: readonly OperationalRole[] = [
  "ADMIN",
  "FRONT_DESK",
  "MANAGER"
];

export type AccessIdentity = {
  role: OperationalRole;
  isActive: boolean;
  organizationId: string;
} | null;

export type AccessDecision =
  | { allowed: true }
  | { allowed: false; reason: "anonymous" | "inactive" | "role" };

export function decideAccess(
  identity: AccessIdentity,
  allowedRoles: readonly OperationalRole[]
): AccessDecision {
  if (!identity) {
    return { allowed: false, reason: "anonymous" };
  }

  if (!identity.isActive) {
    return { allowed: false, reason: "inactive" };
  }

  if (!allowedRoles.includes(identity.role)) {
    return { allowed: false, reason: "role" };
  }

  return { allowed: true };
}

export function isSafeInternalPath(value: string | null | undefined) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}
