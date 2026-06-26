import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authorizeApi } from "@/lib/auth/server";
import { OPERATIONAL_ROLES } from "@/lib/auth/policy";

type PackageRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: PackageRouteContext) {
  const authentication = await authorizeApi(OPERATIONAL_ROLES);

  if (!authentication.ok) {
    return authentication.response;
  }

  const { id } = await context.params;

  const pkg = await prisma.package.findFirst({
    where: { id, organizationId: authentication.operator.organizationId },
    include: {
      organization: true,
      resident: true,
      unit: {
        include: {
          building: true
        }
      },
      events: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!pkg) {
    return NextResponse.json({ error: "Encomenda não encontrada." }, { status: 404 });
  }

  return NextResponse.json({
    package: {
      ...pkg,
      labelPhotoUrl: pkg.labelPhotoUrl ? `/api/packages/${pkg.id}/label` : null
    }
  });
}
