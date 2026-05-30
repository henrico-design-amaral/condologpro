import { PrismaClient, PackageEventType, PackageStatus, OperatorRole } from "@prisma/client";

const prisma = new PrismaClient();

const carriers = [
  "Mercado Livre",
  "Shopee",
  "Amazon",
  "Correios",
  "TikTok Shop",
  "Transportadora",
  "iFood Mercado"
];

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
];

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
];

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function makePhone(index: number) {
  const suffix = String(10000000 + index).slice(-8);
  return `119${suffix}`;
}

function makeResidentName(index: number) {
  return `${randomFrom(firstNames)} ${randomFrom(lastNames)} ${index}`;
}

function makePackageCode(index: number) {
  return `CLP-${String(index).padStart(5, "0")}`;
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
        role: OperatorRole.ADMIN
      },
      {
        organizationId: organization.id,
        name: "Portaria Principal",
        role: OperatorRole.FRONT_DESK
      },
      {
        organizationId: organization.id,
        name: "Síndico Demo",
        role: OperatorRole.MANAGER
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

  const units = [];
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

        units.push(unit);

        const residentsCount = floor % 2 === 0 ? 3 : 2;

        for (let residentIndex = 1; residentIndex <= residentsCount; residentIndex++) {
          await prisma.resident.create({
            data: {
              organizationId: organization.id,
              unitId: unit.id,
              name: makeResidentName(residentCounter),
              phone: makePhone(residentCounter),
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

  for (let index = 1; index <= 30; index++) {
    const resident = randomFrom(residents);
    const status =
      index <= 12
        ? PackageStatus.PENDING
        : index <= 22
          ? PackageStatus.NOTIFIED
          : PackageStatus.PICKED_UP;

    const receivedAt = new Date();
    receivedAt.setHours(receivedAt.getHours() - index);

    const notifiedAt =
      status === PackageStatus.NOTIFIED || status === PackageStatus.PICKED_UP
        ? new Date(receivedAt.getTime() + 5 * 60 * 1000)
        : null;

    const pickedUpAt =
      status === PackageStatus.PICKED_UP
        ? new Date(receivedAt.getTime() + 4 * 60 * 60 * 1000)
        : null;

    const pkg = await prisma.package.create({
      data: {
        organizationId: organization.id,
        unitId: resident.unitId,
        residentId: resident.id,
        packageCode: makePackageCode(index),
        carrier: randomFrom(carriers),
        status,
        notes: index % 5 === 0 ? "Pacote grande. Separar na prateleira inferior." : null,
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
        type: PackageEventType.PACKAGE_RECEIVED,
        message: `Encomenda ${pkg.packageCode} recebida para ${resident.unit.building.label}, apto ${resident.unit.number}.`
      }
    });

    if (notifiedAt) {
      await prisma.packageEvent.create({
        data: {
          organizationId: organization.id,
          packageId: pkg.id,
          type: PackageEventType.PACKAGE_NOTIFIED,
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
          type: PackageEventType.PACKAGE_PICKED_UP,
          message: `Encomenda retirada por ${resident.name}.`,
          createdAt: pickedUpAt
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
    packageEvents: await prisma.packageEvent.count()
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