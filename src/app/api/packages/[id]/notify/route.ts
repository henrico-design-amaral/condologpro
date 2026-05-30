import { NextRequest, NextResponse } from "next/server";
import { getPackageById, markPackageAsNotified } from "@/lib/data";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pkg = await getPackageById(id);

  if (!pkg) {
    return NextResponse.json({ error: "Encomenda não encontrada." }, { status: 404 });
  }

  const updated = await markPackageAsNotified(id, pkg.organizationId);
  return NextResponse.json(updated);
}
