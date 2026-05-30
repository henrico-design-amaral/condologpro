import { NextRequest, NextResponse } from "next/server";
import { createPackage, getDefaultOrg } from "@/lib/data";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    unitId: string;
    residentId?: string;
    carrier?: string;
    labelPhotoUrl?: string;
    notes?: string;
    packageCode?: string;
  };

  const org = await getDefaultOrg();
  if (!org) {
    return NextResponse.json(
      { error: "Organização não encontrada." },
      { status: 404 }
    );
  }

  if (!body.unitId) {
    return NextResponse.json({ error: "unitId obrigatório." }, { status: 400 });
  }

  const pkg = await createPackage({
    organizationId: org.id,
    unitId: body.unitId,
    residentId: body.residentId,
    carrier: body.carrier,
    labelPhotoUrl: body.labelPhotoUrl,
    notes: body.notes,
    packageCode: body.packageCode
  });

  return NextResponse.json(pkg, { status: 201 });
}
