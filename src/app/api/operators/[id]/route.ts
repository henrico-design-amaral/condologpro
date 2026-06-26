import { NextResponse } from "next/server";
import { z } from "zod";

import { OPERATOR_ADMIN_ROLES } from "@/lib/auth/policy";
import { authorizeApi } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

const updateOperatorSchema = z.object({
  isActive: z.boolean()
});

type OperatorRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: OperatorRouteContext) {
  const authentication = await authorizeApi(OPERATOR_ADMIN_ROLES);

  if (!authentication.ok) {
    return authentication.response;
  }

  const { id } = await context.params;

  try {
    const body = updateOperatorSchema.parse(await request.json());

    if (id === authentication.operator.id && !body.isActive) {
      return NextResponse.json(
        { error: "O administrador não pode desativar a própria conta." },
        { status: 400 }
      );
    }

    const target = await prisma.operator.findFirst({
      where: {
        id,
        organizationId: authentication.operator.organizationId
      },
      select: { id: true }
    });

    if (!target) {
      return NextResponse.json({ error: "Operador não encontrado." }, { status: 404 });
    }

    const operator = await prisma.operator.update({
      where: {
        id: target.id,
        organizationId: authentication.operator.organizationId
      },
      data: { isActive: body.isActive },
      select: {
        id: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    return NextResponse.json({ operator });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível atualizar o operador." },
      { status: 400 }
    );
  }
}
