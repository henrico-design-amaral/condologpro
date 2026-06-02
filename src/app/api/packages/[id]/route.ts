import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type PackageRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: PackageRouteContext) {
  const { id } = await context.params;

  const pkg = await prisma.package.findUnique({
    where: { id },
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

  return NextResponse.json({ package: pkg });
}
