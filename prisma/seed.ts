import { PrismaClient, type PackageStatus } from "@prisma/client";

const prisma = new PrismaClient();

const carriers = [
  "Mercado Livre",
  "Shopee",
  "Amazon",
  "Correios",
  "TikTok Shop",
  "Transportadora",
  "iFood Mercado"
] as const;

const firstNames = [
  "Ana",
  "Carlos",
  "Mariana",
  "Rafael",
  "Juliana",
  "Fernando",
  "Patricia",
  "Roberto",
  "Camila",
  "Eduardo",
  "Bianca",
  "Gustavo",
  "Renata",
  "Marcelo",
  "Larissa"
] as const;

const lastNames = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Pereira",
  "Costa",
  "Almeida",
  "Ferreira",
  "Lima",
  "Gomes"
] as const;

const intakeNotes = [
  "Pacote grande. Separar na prateleira inferior.",
  "Caixa pequena. Conferir lacre.",
  "Encomenda frágil. Não empilhar.",
  "Entrega pessoal. Pedir documento na retirada.",
  "Etiqueta sem código visível. Conferir manual."
] as const;

function randomFrom<T>(items: readonly T[]): T {
  const item = items[Math.floor(Math.random() * items.length)];

  if (!item) {
    throw new Error("Cannot pick random item from empty array.");
  }

  return item;
}

function makePhone() {
  return "+55 11 953970704";
}

function makeResidentName(index: number) {
  return `${randomFrom(firstNames)} ${randomFrom(lastNames)} ${index}`;
}

function makePackageCode(index: number) {
  return `CLP-${String(index).padStart(5, "0")}`;
}

type StatusPlan = {
  status: PackageStatus;
  hoursAgo: number;
  notifiedOffsetMinutes?: number;
  pickedUpOffsetHours?: number;
};

function planFor(index: number, total: number): StatusPlan {
  const fraction = index / total;

  if (index <= 3) {
    return {
      status: "PENDING",
      hoursAgo: 36 + index * 12
    };
  }

  if (fraction <= 0.3) {
    return {
      status: "PENDING",
      hoursAgo: 2 + index
    };
  }

  if (fraction <= 0.65) {
    return {
      status: "NOTIFIED",
      hoursAgo: 4 + index,
      notifiedOffsetMinutes: 5
    };
  }

  if (fraction <= 0.95) {
    return {
      status: "PICKED_UP",
      hoursAgo: 6 + index,
      notifiedOffsetMinutes: 8,
      pickedUpOffsetHours: 3
    };
  }

  return {
    status: "CANCELLED",
    hoursAgo: 24 + index
  };
}

async function main() {
  await prisma.packageEvent.deleteMany();
  await prisma.package.deleteMany();
  await prisma.resident.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.building.deleteMany();
  await prisma.operator.deleteMany();
  await prisma.organization.deleteMany();

  const organization = await prisma.organization.create({
    data: {
      name: "Condomínio Demo CondoLogPro",
      address: "Taboão da Serra, São Paulo",
      whatsappPhone: "11999999999"
    }
  });

  await prisma.operator.createMany({
    data: [
      {
        organizationId: organization.id,
        name: "Administração",
        role: "ADMIN"
      },
      {
        organizationId: organization.id,
        name: "Portaria Principal",
        role: "FRONT_DESK"
      },
      {
        organizationId: organization.id,
        name: "Síndico Demo",
        role: "MANAGER"
      }
    ]
  });

  const buildings = [];

  for (let buildingIndex = 1; buildingIndex <= 5; buildingIndex++) {
    const building = await prisma.building.create({
      data: {
        organizationId: organization.id,
        label: `Bloco ${buildingIndex}`
      }
    });

    buildings.push(building);
  }

  let residentCounter = 1;

  for (const building of buildings) {
    for (let floor = 1; floor <= 5; floor++) {
      for (let suffix = 1; suffix <= 2; suffix++) {
        const number = `${floor}0${suffix}`;

        const unit = await prisma.unit.create({
          data: {
            organizationId: organization.id,
            buildingId: building.id,
            number,
            label: `${building.label} / Apto ${number}`
          }
        });

        const residentsCount = floor % 2 === 0 ? 3 : 2;

        for (let residentIndex = 1; residentIndex <= residentsCount; residentIndex++) {
          await prisma.resident.create({
            data: {
              organizationId: organization.id,
              unitId: unit.id,
              name: makeResidentName(residentCounter),
              phone: makePhone(),
              isPrimary: residentIndex === 1,
              notes: residentIndex === 1 ? "Morador principal" : null,
              isActive: true
            }
          });

          residentCounter++;
        }
      }
    }
  }

  const residents = await prisma.resident.findMany({
    include: {
      unit: {
        include: {
          building: true
        }
      }
    }
  });

  if (residents.length === 0) {
    throw new Error("Seed failed: no residents were created.");
  }

  const totalPackages = 32;

  for (let index = 1; index <= totalPackages; index++) {
    const resident = randomFrom(residents);
    const plan = planFor(index, totalPackages);

    const receivedAt = new Date();
    receivedAt.setHours(receivedAt.getHours() - plan.hoursAgo);

    const notifiedAt = plan.notifiedOffsetMinutes
      ? new Date(receivedAt.getTime() + plan.notifiedOffsetMinutes * 60 * 1000)
      : null;

    const pickedUpAt = plan.pickedUpOffsetHours
      ? new Date(receivedAt.getTime() + plan.pickedUpOffsetHours * 60 * 60 * 1000)
      : null;

    const pkg = await prisma.package.create({
      data: {
        organizationId: organization.id,
        unitId: resident.unitId,
        residentId: resident.id,
        packageCode: makePackageCode(index),
        carrier: randomFrom(carriers),
        status: plan.status,
        notes: index % 5 === 0 ? randomFrom(intakeNotes) : null,
        receivedAt,
        notifiedAt,
        pickedUpAt,
        pickedUpByName: pickedUpAt ? resident.name : null,
        pickedUpByDocument: pickedUpAt ? "Documento conferido na portaria" : null
      }
    });

    await prisma.packageEvent.create({
      data: {
        organizationId: organization.id,
        packageId: pkg.id,
        type: "PACKAGE_RECEIVED",
        message: `Encomenda ${pkg.packageCode} recebida para ${resident.unit.building.label}, apto ${resident.unit.number}.`,
        createdAt: receivedAt
      }
    });

    if (notifiedAt) {
      await prisma.packageEvent.create({
        data: {
          organizationId: organization.id,
          packageId: pkg.id,
          type: "PACKAGE_NOTIFIED",
          message: `Morador ${resident.name} notificado por WhatsApp assistido.`,
          createdAt: notifiedAt
        }
      });
    }

    if (pickedUpAt) {
      await prisma.packageEvent.create({
        data: {
          organizationId: organization.id,
          packageId: pkg.id,
          type: "PACKAGE_PICKED_UP",
          message: `Encomenda retirada por ${resident.name}.`,
          createdAt: pickedUpAt
        }
      });
    }

    if (plan.status === "CANCELLED") {
      await prisma.packageEvent.create({
        data: {
          organizationId: organization.id,
          packageId: pkg.id,
          type: "PACKAGE_CANCELLED",
          message: "Encomenda cancelada pelo operador da portaria.",
          createdAt: new Date(receivedAt.getTime() + 30 * 60 * 1000)
        }
      });
    }
  }

  const summary = {
    organization: organization.name,
    buildings: await prisma.building.count(),
    units: await prisma.unit.count(),
    residents: await prisma.resident.count(),
    packages: await prisma.package.count(),
    packageEvents: await prisma.packageEvent.count(),
    pending: await prisma.package.count({ where: { status: "PENDING" } }),
    notified: await prisma.package.count({ where: { status: "NOTIFIED" } }),
    pickedUp: await prisma.package.count({ where: { status: "PICKED_UP" } }),
    cancelled: await prisma.package.count({ where: { status: "CANCELLED" } })
  };

  console.log("Seed completed:", summary);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
