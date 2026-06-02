import { prisma } from "@/lib/prisma";

export const OVERDUE_THRESHOLD_HOURS = 24;

export type DashboardStats = {
  todayCount: number;
  yesterdayCount: number;
  pendingCount: number;
  notifiedCount: number;
  pickedUpTodayCount: number;
  overdueCount: number;
  averagePickupHours: number | null;
  activeResidentCount: number;
  totalBuildings: number;
  totalUnits: number;
};

export type BuildingActivity = {
  buildingLabel: string;
  totalPackages: number;
  pendingPackages: number;
};

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfYesterday() {
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

export function overdueThresholdDate() {
  const now = new Date();
  now.setHours(now.getHours() - OVERDUE_THRESHOLD_HOURS);
  return now;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = startOfDay(new Date());
  const yesterday = startOfYesterday();
  const overdueLimit = overdueThresholdDate();

  const [
    todayCount,
    yesterdayCount,
    pendingCount,
    notifiedCount,
    pickedUpTodayCount,
    overdueCount,
    pickedUpRecent,
    activeResidentCount,
    totalBuildings,
    totalUnits
  ] = await Promise.all([
    prisma.package.count({
      where: { receivedAt: { gte: today } }
    }),
    prisma.package.count({
      where: { receivedAt: { gte: yesterday, lt: today } }
    }),
    prisma.package.count({
      where: { status: "PENDING" }
    }),
    prisma.package.count({
      where: { status: "NOTIFIED" }
    }),
    prisma.package.count({
      where: { status: "PICKED_UP", pickedUpAt: { gte: today } }
    }),
    prisma.package.count({
      where: {
        status: { in: ["PENDING", "NOTIFIED"] },
        receivedAt: { lt: overdueLimit }
      }
    }),
    prisma.package.findMany({
      where: {
        status: "PICKED_UP",
        pickedUpAt: { not: null }
      },
      select: { receivedAt: true, pickedUpAt: true },
      orderBy: { pickedUpAt: "desc" },
      take: 40
    }),
    prisma.resident.count({ where: { isActive: true } }),
    prisma.building.count(),
    prisma.unit.count()
  ]);

  let averagePickupHours: number | null = null;

  if (pickedUpRecent.length > 0) {
    const totalHours = pickedUpRecent.reduce((accumulator, pkg) => {
      if (!pkg.pickedUpAt) {
        return accumulator;
      }

      const diffMs = pkg.pickedUpAt.getTime() - pkg.receivedAt.getTime();
      const hours = Math.max(diffMs / (60 * 60 * 1000), 0);
      return accumulator + hours;
    }, 0);

    averagePickupHours = totalHours / pickedUpRecent.length;
  }

  return {
    todayCount,
    yesterdayCount,
    pendingCount,
    notifiedCount,
    pickedUpTodayCount,
    overdueCount,
    averagePickupHours,
    activeResidentCount,
    totalBuildings,
    totalUnits
  };
}

export async function getBuildingActivity(): Promise<BuildingActivity[]> {
  const buildings = await prisma.building.findMany({
    include: {
      units: {
        include: {
          packages: {
            select: {
              status: true
            }
          }
        }
      }
    },
    orderBy: { label: "asc" }
  });

  return buildings
    .map((building) => {
      const packages = building.units.flatMap((unit) => unit.packages);
      const pendingPackages = packages.filter((pkg) =>
        pkg.status === "PENDING" || pkg.status === "NOTIFIED"
      ).length;

      return {
        buildingLabel: building.label,
        totalPackages: packages.length,
        pendingPackages
      };
    })
    .sort((left, right) => right.totalPackages - left.totalPackages);
}

export function isPackageOverdue(pkg: { status: string; receivedAt: Date }) {
  if (pkg.status !== "PENDING" && pkg.status !== "NOTIFIED") {
    return false;
  }

  return pkg.receivedAt.getTime() < overdueThresholdDate().getTime();
}

export function formatAverageHours(value: number | null) {
  if (value === null) {
    return "Sem dados";
  }

  if (value < 1) {
    const minutes = Math.round(value * 60);
    return `${minutes} min`;
  }

  if (value < 24) {
    return `${value.toFixed(1).replace(".", ",")} h`;
  }

  const days = value / 24;
  return `${days.toFixed(1).replace(".", ",")} dias`;
}
