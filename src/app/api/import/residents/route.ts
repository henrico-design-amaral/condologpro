import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/import-csv";
import { authorizeApi } from "@/lib/auth/server";
import { ADMIN_ROLES } from "@/lib/auth/policy";

const importSchema = z.object({
  csv: z.string().min(1, "Cole o CSV ou anexe um arquivo."),
  mode: z.enum(["preview", "commit"])
});

type ImportResult = {
  created: {
    buildings: number;
    units: number;
    residents: number;
  };
  skipped: number;
};

export async function POST(request: Request) {
  const authentication = await authorizeApi(ADMIN_ROLES);

  if (!authentication.ok) {
    return authentication.response;
  }

  try {
    const body = importSchema.parse(await request.json());
    const preview = parseCsv(body.csv);

    if (body.mode === "preview") {
      return NextResponse.json({ mode: "preview", preview });
    }

    if (preview.missingHeaders.length > 0) {
      return NextResponse.json(
        {
          error: `Cabeçalho incompleto. Faltando: ${preview.missingHeaders.join(", ")}`
        },
        { status: 400 }
      );
    }

    const validRows = preview.rows.filter((row) => row.errors.length === 0);

    if (validRows.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma linha válida para importar." },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findFirst({
      where: { id: authentication.operator.organizationId },
      orderBy: { createdAt: "asc" }
    });

    if (!organization) {
      return NextResponse.json(
        {
          error: "Nenhum condomínio configurado. Rode o seed inicial antes de importar."
        },
        { status: 400 }
      );
    }

    const result: ImportResult = {
      created: { buildings: 0, units: 0, residents: 0 },
      skipped: 0
    };

    for (const row of validRows) {
      const existingBuilding = await prisma.building.findFirst({
        where: { organizationId: organization.id, label: row.building }
      });

      const building =
        existingBuilding ??
        (await prisma.building.create({
          data: {
            organizationId: organization.id,
            label: row.building
          }
        }));

      if (!existingBuilding) {
        result.created.buildings += 1;
      }

      const existingUnit = await prisma.unit.findFirst({
        where: {
          organizationId: organization.id,
          buildingId: building.id,
          number: row.unit
        }
      });

      const unit =
        existingUnit ??
        (await prisma.unit.create({
          data: {
            organizationId: organization.id,
            buildingId: building.id,
            number: row.unit,
            label: `${building.label} / Apto ${row.unit}`
          }
        }));

      if (!existingUnit) {
        result.created.units += 1;
      }

      const existingResident = await prisma.resident.findFirst({
        where: {
          organizationId: organization.id,
          unitId: unit.id,
          name: row.name
        }
      });

      if (existingResident) {
        result.skipped += 1;
        continue;
      }

      await prisma.resident.create({
        data: {
          organizationId: organization.id,
          unitId: unit.id,
          name: row.name,
          phone: row.phone,
          isPrimary: row.isPrimary,
          notes: row.notes,
          isActive: true
        }
      });

      result.created.residents += 1;
    }

    return NextResponse.json({ mode: "commit", result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Não foi possível processar a importação."
      },
      { status: 400 }
    );
  }
}
