import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { authorizeApi } from "@/lib/auth/server";
import { OPERATIONAL_ROLES } from "@/lib/auth/policy";

const pickupSchema = z.object({
  pickedUpByName: z.string().trim().min(2, "Informe quem retirou a encomenda."),
  pickedUpByDocument: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

type PickupRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: PickupRouteContext) {
  const authentication = await authorizeApi(OPERATIONAL_ROLES);

  if (!authentication.ok) {
    return authentication.response;
  }

  const { id } = await context.params;
  const body = pickupSchema.parse(await request.json());

  const pkg = await prisma.package.findFirst({
    where: { id, organizationId: authentication.operator.organizationId }
  });

  if (!pkg) {
    return NextResponse.json({ error: "Encomenda não encontrada." }, { status: 404 });
  }

  if (pkg.status === "PICKED_UP") {
    return NextResponse.json(
      { error: "Esta encomenda já foi retirada." },
      { status: 400 }
    );
  }

  const pickedUpAt = new Date();
  const notes = body.notes ? `${pkg.notes ? `${pkg.notes}\n` : ""}Retirada: ${body.notes}` : pkg.notes;

  const updated = await prisma.package.update({
    where: { id, organizationId: authentication.operator.organizationId },
    data: {
      status: "PICKED_UP",
      pickedUpAt,
      pickedUpByName: body.pickedUpByName,
      pickedUpByDocument: body.pickedUpByDocument || null,
      notes,
      events: {
        create: {
          organizationId: pkg.organizationId,
          type: "PACKAGE_PICKED_UP",
          message: `Encomenda retirada por ${body.pickedUpByName}.`,
          createdAt: pickedUpAt,
          metadata: JSON.stringify({
            pickedUpByDocument: body.pickedUpByDocument || null,
            notes: body.notes || null
          })
        }
      }
    }
  });

  return NextResponse.json({ package: updated });
}
