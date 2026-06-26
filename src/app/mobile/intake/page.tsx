import { IntakeForm } from "./intake-form";
import { OPERATIONAL_ROLES } from "@/lib/auth/policy";
import { requirePageOperator } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function MobileIntakePage() {
  await requirePageOperator(OPERATIONAL_ROLES, "/mobile/intake");
  return (
    <main className="min-h-screen bg-neutral-950">
      <IntakeForm />
    </main>
  );
}
