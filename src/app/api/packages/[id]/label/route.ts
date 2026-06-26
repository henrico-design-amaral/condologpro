import { NextResponse } from "next/server";

import { OPERATIONAL_ROLES } from "@/lib/auth/policy";
import { authorizeApi } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import {
  createSignedLabelUrl,
  detectStorageMode,
  readLocalLabelPhoto
} from "@/lib/storage";
import { isOrganizationLabelPath } from "@/lib/storage-policy";

type LabelRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: LabelRouteContext) {
  const authentication = await authorizeApi(OPERATIONAL_ROLES);

  if (!authentication.ok) {
    return authentication.response;
  }

  const { id } = await context.params;
  const pkg = await prisma.package.findFirst({
    where: {
      id,
      organizationId: authentication.operator.organizationId
    },
    select: {
      labelPhotoUrl: true
    }
  });

  if (!pkg?.labelPhotoUrl) {
    return NextResponse.json({ error: "Etiqueta não encontrada." }, { status: 404 });
  }

  if (!isOrganizationLabelPath(pkg.labelPhotoUrl, authentication.operator.organizationId)) {
    return NextResponse.json({ error: "Etiqueta não encontrada." }, { status: 404 });
  }

  if (detectStorageMode() === "supabase-private") {
    const signedUrl = await createSignedLabelUrl(pkg.labelPhotoUrl);

    if (!signedUrl) {
      return NextResponse.json({ error: "Etiqueta indisponível." }, { status: 404 });
    }

    return NextResponse.redirect(signedUrl, {
      headers: {
        "Cache-Control": "private, no-store"
      }
    });
  }

  if (detectStorageMode() === "misconfigured") {
    return NextResponse.json(
      { error: "Storage indisponível neste ambiente." },
      { status: 503 }
    );
  }

  try {
    const stored = await readLocalLabelPhoto(pkg.labelPhotoUrl);
    return new NextResponse(stored.body, {
      headers: {
        "Content-Type": stored.contentType,
        "Cache-Control": "private, no-store"
      }
    });
  } catch {
    return NextResponse.json({ error: "Etiqueta não encontrada." }, { status: 404 });
  }
}
