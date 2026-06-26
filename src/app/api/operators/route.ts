import { NextResponse } from "next/server";
import { z } from "zod";

import { OPERATOR_ADMIN_ROLES } from "@/lib/auth/policy";
import { authorizeApi } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

const createOperatorSchema = z.object({
  authSubject: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  role: z.enum(["ADMIN", "FRONT_DESK", "MANAGER"])
});

export async function POST(request: Request) {
  const authentication = await authorizeApi(OPERATOR_ADMIN_ROLES);

  if (!authentication.ok) {
    return authentication.response;
  }

  try {
    const body = createOperatorSchema.parse(await request.json());
    const operator = await prisma.operator.create({
      data: {
        organizationId: authentication.operator.organizationId,
        authSubject: body.authSubject,
        name: body.name,
        role: body.role
      },
      select: {
        id: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    return NextResponse.json({ operator }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível vincular o operador." },
      { status: 400 }
    );
  }
}
