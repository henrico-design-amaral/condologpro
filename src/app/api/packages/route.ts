import { NextRequest, NextResponse } from "next/server";
import { PackageStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { buildPackageNotificationMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

const createPackageSchema = z.object({
  residentId: z.string().min(1),
  unitId: z.string().min(1),
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
  const status = request.nextUrl.searchParams.get("status");
  const search = request.nextUrl.searchParams.get("q")?.trim();
  const parsedStatus = parsePackageStatus(status);
  const where: Prisma.PackageWhereInput = {
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

  return NextResponse.json({ packages });
}

export async function POST(request: Request) {
  try {
    const body = createPackageSchema.parse(await request.json());

    const resident = await prisma.resident.findFirst({
      where: {
        id: body.residentId,
        unitId: body.unitId,
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

    const pkg = await prisma.package.create({
      data: {
        organizationId: resident.organizationId,
        unitId: resident.unitId,
        residentId: resident.id,
        labelPhotoUrl: cleanOptional(body.labelPhotoUrl),
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
      package: pkg,
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
