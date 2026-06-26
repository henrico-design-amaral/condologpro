import assert from "node:assert/strict";

import {
  ADMIN_ROLES,
  OPERATIONAL_ROLES,
  OPERATOR_ADMIN_ROLES,
  decideAccess,
  isSafeInternalPath
} from "../src/lib/auth/policy";
import {
  buildLabelStoragePath,
  hasExpectedImageSignature,
  isOrganizationLabelPath,
  joinSignedStorageUrl,
  resolveStorageMode
} from "../src/lib/storage-policy";

assert.deepEqual(decideAccess(null, OPERATIONAL_ROLES), {
  allowed: false,
  reason: "anonymous"
});

assert.deepEqual(
  decideAccess(
    { role: "FRONT_DESK", isActive: true, organizationId: "org-a" },
    OPERATIONAL_ROLES
  ),
  { allowed: true }
);

assert.deepEqual(
  decideAccess(
    { role: "FRONT_DESK", isActive: true, organizationId: "org-a" },
    ADMIN_ROLES
  ),
  { allowed: false, reason: "role" }
);

assert.deepEqual(
  decideAccess({ role: "ADMIN", isActive: true, organizationId: "org-a" }, ADMIN_ROLES),
  { allowed: true }
);
assert.deepEqual(
  decideAccess(
    { role: "MANAGER", isActive: true, organizationId: "org-a" },
    OPERATOR_ADMIN_ROLES
  ),
  { allowed: false, reason: "role" }
);

assert.deepEqual(
  decideAccess({ role: "ADMIN", isActive: false, organizationId: "org-a" }, ADMIN_ROLES),
  { allowed: false, reason: "inactive" }
);

assert.equal(isSafeInternalPath("/mobile/intake"), true);
assert.equal(isSafeInternalPath("//attacker.example"), false);
assert.equal(isSafeInternalPath("https://attacker.example"), false);

assert.equal(resolveStorageMode({}), "local");
assert.equal(resolveStorageMode({ url: "https://preview.supabase.co" }), "misconfigured");
assert.equal(
  resolveStorageMode({
    url: "https://preview.supabase.co",
    bucket: "package-labels",
    serviceKey: "server-only"
  }),
  "supabase-private"
);

const path = buildLabelStoragePath({
  organizationId: "org-a",
  mimeType: "image/jpeg",
  date: "2026-06-21",
  id: "random-id"
});
assert.equal(path, "organizations/org-a/labels/2026-06-21/random-id.jpg");
assert.equal(isOrganizationLabelPath(path, "org-a"), true);
assert.equal(isOrganizationLabelPath(path, "org-b"), false);
assert.equal(
  joinSignedStorageUrl("https://preview.supabase.co/", "/object/sign/package-labels/token"),
  "https://preview.supabase.co/storage/v1/object/sign/package-labels/token"
);

assert.equal(hasExpectedImageSignature(Uint8Array.from([0xff, 0xd8, 0xff]), "image/jpeg"), true);
assert.equal(
  hasExpectedImageSignature(
    Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    "image/png"
  ),
  true
);
assert.equal(
  hasExpectedImageSignature(
    Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]),
    "image/webp"
  ),
  true
);
assert.equal(hasExpectedImageSignature(Uint8Array.from([0x3c, 0x73, 0x76, 0x67]), "image/png"), false);

console.log("Auth and private storage policy tests passed.");
