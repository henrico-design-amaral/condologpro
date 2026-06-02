import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ residents: [] });
  }

  const digits = query.replace(/\D/g, "");

  const residents = await prisma.resident.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query } },
        { phone: digits ? { contains: digits } : undefined },
        {
          unit: {
            number: { contains: query }
          }
        },
        {
          unit: {
            building: {
              label: { contains: query }
            }
          }
        }
      ]
    },
    include: {
      unit: {
        include: {
          building: true
        }
      }
    },
    orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    take: 12
  });

  return NextResponse.json({
    residents: residents.map((resident) => ({
      id: resident.id,
      unitId: resident.unitId,
      name: resident.name,
      phone: resident.phone,
      isPrimary: resident.isPrimary,
      buildingLabel: resident.unit.building.label,
      unitNumber: resident.unit.number
    }))
  });
}
