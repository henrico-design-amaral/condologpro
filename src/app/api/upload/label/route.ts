import { NextResponse } from "next/server";

import { storeLabelPhoto } from "@/lib/storage";
import { authorizeApi } from "@/lib/auth/server";
import { OPERATIONAL_ROLES } from "@/lib/auth/policy";

export async function POST(request: Request) {
  const authentication = await authorizeApi(OPERATIONAL_ROLES);

  if (!authentication.ok) {
    return authentication.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Envie uma imagem da etiqueta para continuar." },
        { status: 400 }
      );
    }

    const stored = await storeLabelPhoto(file, authentication.operator.organizationId);
    return NextResponse.json(stored);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar a foto da etiqueta."
      },
      { status: 400 }
    );
  }
}
