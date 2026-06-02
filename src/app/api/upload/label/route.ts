import { NextResponse } from "next/server";

import { storeLabelPhoto } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Envie uma imagem da etiqueta para continuar." },
        { status: 400 }
      );
    }

    const stored = await storeLabelPhoto(file);
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
