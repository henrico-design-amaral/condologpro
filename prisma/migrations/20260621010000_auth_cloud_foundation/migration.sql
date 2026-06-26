-- AlterTable
ALTER TABLE "Operator" ADD COLUMN     "authSubject" TEXT;

-- Expand-only idempotency key. Existing rows remain valid with NULL.
ALTER TABLE "Package" ADD COLUMN     "clientRequestId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Operator_authSubject_key" ON "Operator"("authSubject");

-- CreateIndex
CREATE INDEX "Operator_organizationId_isActive_idx" ON "Operator"("organizationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Package_organizationId_clientRequestId_key" ON "Package"("organizationId", "clientRequestId");

-- Defense in depth: operational data is server-only. The browser never queries
-- these tables through PostgREST, so anon/authenticated receive no grants.
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Building" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Unit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Resident" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Operator" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Package" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PackageEvent" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE "Organization" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "Building" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "Unit" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "Resident" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "Operator" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "Package" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "PackageEvent" FROM anon, authenticated;

-- Supabase Storage bucket is private. Upload and signing use the service role
-- only in server Route Handlers; no public or browser Storage policy is added.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'package-labels',
  'package-labels',
  false,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
