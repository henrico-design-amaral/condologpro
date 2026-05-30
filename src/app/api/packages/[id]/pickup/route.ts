import { NextRequest, NextResponse } from "next/server";
import { getPackageById, markPackageAsPickedUp } from "@/lib/data";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pkg = await getPackageById(id);

  if (!pkg) {
    return NextResponse.json({ error: "Encomenda não encontrada." }, { status: 404 });
  }

  const body = (await req.json()) as {
    pickedUpByName: string;
    pickedUpByDocument?: string;
    notes?: string;
  };

  if (!body.pickedUpByName) {
    return NextResponse.json(
      { error: "Nome de quem retirou é obrigatório." },
      { status: 400 }
    );
  }

  const updated = await markPackageAsPickedUp(id, {
    organizationId: pkg.organizationId,
    pickedUpByName: body.pickedUpByName,
    pickedUpByDocument: body.pickedUpByDocument,
    notes: body.notes
  });

  return NextResponse.json(updated);
}
