import { PackageStatus, PackageEventType } from "@prisma/client";
import { prisma } from "./prisma";

export async function getDefaultOrg() {
  return prisma.organization.findFirst();
}

export async function getDashboardSummary(organizationId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayTotal, pending, notified, pickedUpToday] = await Promise.all([
    prisma.package.count({
      where: { organizationId, receivedAt: { gte: today } }
    }),
    prisma.package.count({
      where: { organizationId, status: PackageStatus.PENDING }
    }),
    prisma.package.count({
      where: { organizationId, status: PackageStatus.NOTIFIED }
    }),
    prisma.package.count({
      where: {
        organizationId,
        status: PackageStatus.PICKED_UP,
        pickedUpAt: { gte: today }
      }
    })
  ]);

  return { todayTotal, pending, notified, pickedUpToday };
}

export async function getRecentPackages(organizationId: string, limit = 10) {
  return prisma.package.findMany({
    where: { organizationId },
    orderBy: { receivedAt: "desc" },
    take: limit,
    include: {
      unit: { include: { building: true } },
      resident: true
    }
  });
}

export async function getResidentsForSelect(organizationId: string) {
  return prisma.resident.findMany({
    where: { organizationId, isActive: true },
    include: {
      unit: { include: { building: true } }
    },
    orderBy: [
      { unit: { building: { label: "asc" } } },
      { unit: { number: "asc" } },
      { isPrimary: "desc" },
      { name: "asc" }
    ]
  });
}

export async function getPendingPackages(organizationId: string) {
  return prisma.package.findMany({
    where: {
      organizationId,
      status: { in: [PackageStatus.PENDING, PackageStatus.NOTIFIED] }
    },
    orderBy: { receivedAt: "desc" },
    include: {
      unit: { include: { building: true } },
      resident: true
    }
  });
}

export async function getAllPackages(organizationId: string) {
  return prisma.package.findMany({
    where: { organizationId },
    orderBy: { receivedAt: "desc" },
    include: {
      unit: { include: { building: true } },
      resident: true
    }
  });
}

export async function getAllResidents(organizationId: string) {
  return prisma.resident.findMany({
    where: { organizationId },
    include: {
      unit: { include: { building: true } }
    },
    orderBy: [
      { unit: { building: { label: "asc" } } },
      { unit: { number: "asc" } },
      { isPrimary: "desc" },
      { name: "asc" }
    ]
  });
}

export async function getPackageById(id: string) {
  return prisma.package.findUnique({
    where: { id },
    include: {
      unit: { include: { building: true } },
      resident: true,
      organization: true,
      events: { orderBy: { createdAt: "asc" } }
    }
  });
}

export async function createPackage(data: {
  organizationId: string;
  unitId: string;
  residentId?: string;
  carrier?: string;
  labelPhotoUrl?: string;
  notes?: string;
  packageCode?: string;
}) {
  const pkg = await prisma.package.create({
    data: { ...data, status: PackageStatus.PENDING }
  });

  await prisma.packageEvent.create({
    data: {
      organizationId: data.organizationId,
      packageId: pkg.id,
      type: PackageEventType.PACKAGE_RECEIVED,
      message: "Encomenda registrada na portaria."
    }
  });

  return pkg;
}

export async function markPackageAsNotified(
  id: string,
  organizationId: string
) {
  const pkg = await prisma.package.update({
    where: { id },
    data: { status: PackageStatus.NOTIFIED, notifiedAt: new Date() }
  });

  await prisma.packageEvent.create({
    data: {
      organizationId,
      packageId: id,
      type: PackageEventType.PACKAGE_NOTIFIED,
      message: "Morador notificado via WhatsApp."
    }
  });

  return pkg;
}

export async function markPackageAsPickedUp(
  id: string,
  data: {
    organizationId: string;
    pickedUpByName: string;
    pickedUpByDocument?: string;
    notes?: string;
  }
) {
  const pkg = await prisma.package.update({
    where: { id },
    data: {
      status: PackageStatus.PICKED_UP,
      pickedUpAt: new Date(),
      pickedUpByName: data.pickedUpByName,
      pickedUpByDocument: data.pickedUpByDocument,
      notes: data.notes
    }
  });

  await prisma.packageEvent.create({
    data: {
      organizationId: data.organizationId,
      packageId: id,
      type: PackageEventType.PACKAGE_PICKED_UP,
      message: `Retirada confirmada por ${data.pickedUpByName}.`
    }
  });

  return pkg;
}
