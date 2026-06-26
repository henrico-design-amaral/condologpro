import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

const protectedApiRoutes = [
  "src/app/api/import/residents/route.ts",
  "src/app/api/operators/route.ts",
  "src/app/api/operators/[id]/route.ts",
  "src/app/api/packages/route.ts",
  "src/app/api/packages/[id]/route.ts",
  "src/app/api/packages/[id]/label/route.ts",
  "src/app/api/packages/[id]/notify/route.ts",
  "src/app/api/packages/[id]/pickup/route.ts",
  "src/app/api/residents/search/route.ts",
  "src/app/api/upload/label/route.ts"
];

const protectedPages = [
  "src/app/admin/page.tsx",
  "src/app/admin/history/page.tsx",
  "src/app/admin/import/page.tsx",
  "src/app/admin/packages/page.tsx",
  "src/app/admin/residents/page.tsx",
  "src/app/admin/settings/page.tsx",
  "src/app/mobile/page.tsx",
  "src/app/mobile/intake/page.tsx",
  "src/app/mobile/package/[id]/page.tsx",
  "src/app/mobile/pending/page.tsx"
];

for (const file of protectedApiRoutes) {
  assert.match(await read(file), /authorizeApi\(/, `${file} must authorize on the server`);
}

for (const file of protectedPages) {
  const source = await read(file);
  assert.match(source, /requirePageOperator\(/, `${file} must authorize on the server`);
  assert.match(source, /dynamic\s*=\s*"force-dynamic"/, `${file} must render per request`);
}

const storage = await read("src/lib/storage.ts");
assert.doesNotMatch(storage, /getPublicUrl|SUPABASE_STORAGE_PUBLIC/);
assert.match(storage, /SUPABASE_SERVICE_ROLE_KEY/);
assert.match(storage, /createSignedLabelUrl/);

const migration = await read(
  "prisma/migrations/20260621010000_auth_cloud_foundation/migration.sql"
);
assert.match(migration, /ADD COLUMN\s+"authSubject"/);
assert.match(migration, /Package_organizationId_clientRequestId_key/);
assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
assert.match(migration, /public, file_size_limit/);
assert.match(migration, /false,/);

const packageJson = JSON.parse(await read("package.json"));
assert.match(packageJson.scripts["prisma:supabase:push"], /block-cloud-db-push/);
assert.ok(packageJson.scripts["prisma:supabase:migrate:deploy"]);
assert.ok(packageJson.scripts["prisma:supabase:migrate:status"]);

const packageRoute = await read("src/app/api/packages/route.ts");
assert.match(packageRoute, /package\.upsert\(/);
assert.match(packageRoute, /organizationId_clientRequestId/);

const clientFiles = ["src/app/mobile/intake/intake-form.tsx"];
for (const file of clientFiles) {
  assert.doesNotMatch(await read(file), /SUPABASE_SERVICE_ROLE_KEY/);
}

const supabaseServer = await read("src/lib/supabase/server.ts");
assert.match(supabaseServer, /httpOnly:\s*true/);
assert.match(supabaseServer, /sameSite:\s*"lax"/);
assert.match(supabaseServer, /secure:\s*process\.env\.NODE_ENV === "production"/);

console.log("Cloud foundation static gates passed.");
