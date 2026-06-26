import { NextRequest, NextResponse } from "next/server";
import { PackageStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { buildPackageNotificationMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { authorizeApi } from "@/lib/auth/server";
import { OPERATIONAL_ROLES } from "@/lib/auth/policy";
import { isOrganizationLabelPath } from "@/lib/storage-policy";

const createPackageSchema = z.object({
  residentId: z.string().min(1),
  unitId: z.string().min(1),
  clientRequestId: z.string().uuid(),
  labelPhotoUrl: z.string().optional(),
  packageCode: z.string().optional(),
  carrier: z.string().optional(),
  notes: z.string().optional()
});

function cleanOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parsePackageStatus(value: string | null) {
  if (!value) {
    return null;
  }

  return Object.values(PackageStatus).includes(value as PackageStatus)
    ? (value as PackageStatus)
    : null;
}

export async function GET(request: NextRequest) {
  const authentication = await authorizeApi(OPERATIONAL_ROLES);

  if (!authentication.ok) {
    return authentication.response;
  }

  const status = request.nextUrl.searchParams.get("status");
  const search = request.nextUrl.searchParams.get("q")?.trim();
  const parsedStatus = parsePackageStatus(status);
  const where: Prisma.PackageWhereInput = {
    organizationId: authentication.operator.organizationId,
    ...(status === "pending"
      ? { status: { in: [PackageStatus.PENDING, PackageStatus.NOTIFIED] } }
      : parsedStatus
        ? { status: parsedStatus }
        : {}),
    ...(search
      ? {
          OR: [
            { packageCode: { contains: search } },
            { carrier: { contains: search } },
            { resident: { name: { contains: search } } },
            { unit: { number: { contains: search } } },
            { unit: { building: { label: { contains: search } } } }
          ]
        }
      : {})
  };

  const packages = await prisma.package.findMany({
    where,
    include: {
      organization: true,
      resident: true,
      unit: {
        include: {
          building: true
        }
      }
    },
    orderBy: {
      receivedAt: "desc"
    },
    take: 80
  });

  return NextResponse.json({
    packages: packages.map((pkg) => ({
      ...pkg,
      labelPhotoUrl: pkg.labelPhotoUrl ? `/api/packages/${pkg.id}/label` : null
    }))
  });
}

export async function POST(request: Request) {
  const authentication = await authorizeApi(OPERATIONAL_ROLES);

  if (!authentication.ok) {
    return authentication.response;
  }

  try {
    const body = createPackageSchema.parse(await request.json());
    const labelPhotoPath = cleanOptional(body.labelPhotoUrl);

    if (
      labelPhotoPath &&
      !isOrganizationLabelPath(labelPhotoPath, authentication.operator.organizationId)
    ) {
      return NextResponse.json({ error: "Caminho de etiqueta inválido." }, { status: 400 });
    }

    const resident = await prisma.resident.findFirst({
      where: {
        id: body.residentId,
        unitId: body.unitId,
        organizationId: authentication.operator.organizationId,
        isActive: true
      },
      include: {
        organization: true,
        unit: {
          include: {
            building: true
          }
        }
      }
    });

    if (!resident) {
      return NextResponse.json(
        { error: "Selecione um morador válido antes de registrar a encomenda." },
        { status: 400 }
      );
    }

    const pkg = await prisma.package.upsert({
      where: {
        organizationId_clientRequestId: {
          organizationId: resident.organizationId,
          clientRequestId: body.clientRequestId
        }
      },
      create: {
        organizationId: resident.organizationId,
        unitId: resident.unitId,
        residentId: resident.id,
        clientRequestId: body.clientRequestId,
        labelPhotoUrl: labelPhotoPath,
        packageCode: cleanOptional(body.packageCode),
        carrier: cleanOptional(body.carrier),
        notes: cleanOptional(body.notes),
        events: {
          create: {
            organizationId: resident.organizationId,
            type: "PACKAGE_RECEIVED",
            message: `Encomenda recebida para ${resident.unit.building.label}, apto ${resident.unit.number}, morador ${resident.name}.`
          }
        }
      },
      update: {},
      include: {
        organization: true,
        resident: true,
        unit: {
          include: {
            building: true
          }
        }
      }
    });

    const message = buildPackageNotificationMessage({
      residentName: resident.name,
      condominiumName: resident.organization.name,
      buildingLabel: resident.unit.building.label,
      unitLabel: resident.unit.number,
      receivedAt: pkg.receivedAt
    });

    const whatsappUrl = resident.phone ? buildWhatsAppUrl(resident.phone, message) : null;

    return NextResponse.json({
      package: {
        ...pkg,
        labelPhotoUrl: pkg.labelPhotoUrl ? `/api/packages/${pkg.id}/label` : null
      },
      whatsappMessage: message,
      whatsappUrl
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível registrar a encomenda."
      },
      { status: 400 }
    );
  }
}
