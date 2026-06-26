import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authorizeApi } from "@/lib/auth/server";
import { OPERATIONAL_ROLES } from "@/lib/auth/policy";

type NotifyRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: NotifyRouteContext) {
  const authentication = await authorizeApi(OPERATIONAL_ROLES);

  if (!authentication.ok) {
    return authentication.response;
  }

  const { id } = await context.params;

  const pkg = await prisma.package.findFirst({
    where: { id, organizationId: authentication.operator.organizationId }
  });

  if (!pkg) {
    return NextResponse.json({ error: "Encomenda não encontrada." }, { status: 404 });
  }

  if (pkg.status === "PICKED_UP" || pkg.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Esta encomenda não pode mais ser marcada como notificada." },
      { status: 400 }
    );
  }

  const notifiedAt = new Date();

  const updated = await prisma.package.update({
    where: { id, organizationId: authentication.operator.organizationId },
    data: {
      status: "NOTIFIED",
      notifiedAt,
      events: {
        create: {
          organizationId: pkg.organizationId,
          type: "PACKAGE_NOTIFIED",
          message: "Morador notificado por WhatsApp assistido.",
          createdAt: notifiedAt
        }
      }
    }
  });

  return NextResponse.json({ package: updated });
}
