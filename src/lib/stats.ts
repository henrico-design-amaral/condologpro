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

export type MobileSummaryStats = {
  pendingCount: number;
  notifiedCount: number;
  todayCount: number;
  pickedUpTodayCount: number;
  overdueCount: number;
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

function isSqliteDatasource() {
  return (process.env.DATABASE_URL ?? "").startsWith("file:");
}

function asNumber(value: unknown) {
  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return 0;
}

function asNullableNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  return asNumber(value);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = startOfDay(new Date());
  const yesterday = startOfYesterday();
  const overdueLimit = overdueThresholdDate();

  const rows = isSqliteDatasource()
    ? await prisma.$queryRaw<
        Array<{
          todayCount: unknown;
          yesterdayCount: unknown;
          pendingCount: unknown;
          notifiedCount: unknown;
          pickedUpTodayCount: unknown;
          overdueCount: unknown;
          averagePickupHours: unknown;
          activeResidentCount: unknown;
          totalBuildings: unknown;
          totalUnits: unknown;
        }>
      >`
        SELECT
          COALESCE(SUM(CASE WHEN receivedAt >= ${today} THEN 1 ELSE 0 END), 0) AS todayCount,
          COALESCE(SUM(CASE WHEN receivedAt >= ${yesterday} AND receivedAt < ${today} THEN 1 ELSE 0 END), 0) AS yesterdayCount,
          COALESCE(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0) AS pendingCount,
          COALESCE(SUM(CASE WHEN status = 'NOTIFIED' THEN 1 ELSE 0 END), 0) AS notifiedCount,
          COALESCE(SUM(CASE WHEN status = 'PICKED_UP' AND pickedUpAt >= ${today} THEN 1 ELSE 0 END), 0) AS pickedUpTodayCount,
          COALESCE(SUM(CASE WHEN status IN ('PENDING', 'NOTIFIED') AND receivedAt < ${overdueLimit} THEN 1 ELSE 0 END), 0) AS overdueCount,
          (
            SELECT AVG((pickedUpAt - receivedAt) / 3600000.0)
            FROM (
              SELECT receivedAt, pickedUpAt
              FROM Package
              WHERE status = 'PICKED_UP' AND pickedUpAt IS NOT NULL
              ORDER BY pickedUpAt DESC
              LIMIT 40
            ) picked
          ) AS averagePickupHours,
          (SELECT COUNT(*) FROM Resident WHERE isActive = 1) AS activeResidentCount,
          (SELECT COUNT(*) FROM Building) AS totalBuildings,
          (SELECT COUNT(*) FROM Unit) AS totalUnits
        FROM Package
      `
    : await prisma.$queryRaw<
        Array<{
          todayCount: unknown;
          yesterdayCount: unknown;
          pendingCount: unknown;
          notifiedCount: unknown;
          pickedUpTodayCount: unknown;
          overdueCount: unknown;
          averagePickupHours: unknown;
          activeResidentCount: unknown;
          totalBuildings: unknown;
          totalUnits: unknown;
        }>
      >`
        SELECT
          COALESCE(SUM(CASE WHEN "receivedAt" >= ${today} THEN 1 ELSE 0 END), 0) AS "todayCount",
          COALESCE(SUM(CASE WHEN "receivedAt" >= ${yesterday} AND "receivedAt" < ${today} THEN 1 ELSE 0 END), 0) AS "yesterdayCount",
          COALESCE(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0) AS "pendingCount",
          COALESCE(SUM(CASE WHEN status = 'NOTIFIED' THEN 1 ELSE 0 END), 0) AS "notifiedCount",
          COALESCE(SUM(CASE WHEN status = 'PICKED_UP' AND "pickedUpAt" >= ${today} THEN 1 ELSE 0 END), 0) AS "pickedUpTodayCount",
          COALESCE(SUM(CASE WHEN status IN ('PENDING', 'NOTIFIED') AND "receivedAt" < ${overdueLimit} THEN 1 ELSE 0 END), 0) AS "overdueCount",
          (
            SELECT AVG(EXTRACT(EPOCH FROM ("pickedUpAt" - "receivedAt")) / 3600.0)
            FROM (
              SELECT "receivedAt", "pickedUpAt"
              FROM "Package"
              WHERE status = 'PICKED_UP' AND "pickedUpAt" IS NOT NULL
              ORDER BY "pickedUpAt" DESC
              LIMIT 40
            ) picked
          ) AS "averagePickupHours",
          (SELECT COUNT(*) FROM "Resident" WHERE "isActive" = true) AS "activeResidentCount",
          (SELECT COUNT(*) FROM "Building") AS "totalBuildings",
          (SELECT COUNT(*) FROM "Unit") AS "totalUnits"
        FROM "Package"
      `;

  const stats = rows[0];

  return {
    todayCount: asNumber(stats?.todayCount),
    yesterdayCount: asNumber(stats?.yesterdayCount),
    pendingCount: asNumber(stats?.pendingCount),
    notifiedCount: asNumber(stats?.notifiedCount),
    pickedUpTodayCount: asNumber(stats?.pickedUpTodayCount),
    overdueCount: asNumber(stats?.overdueCount),
    averagePickupHours: asNullableNumber(stats?.averagePickupHours),
    activeResidentCount: asNumber(stats?.activeResidentCount),
    totalBuildings: asNumber(stats?.totalBuildings),
    totalUnits: asNumber(stats?.totalUnits)
  };
}

export async function getBuildingActivity(limit = 5): Promise<BuildingActivity[]> {
  const rows = isSqliteDatasource()
    ? await prisma.$queryRaw<
        Array<{ buildingLabel: string; totalPackages: unknown; pendingPackages: unknown }>
      >`
        SELECT
          b.label AS buildingLabel,
          COUNT(p.id) AS totalPackages,
          COALESCE(SUM(CASE WHEN p.status IN ('PENDING', 'NOTIFIED') THEN 1 ELSE 0 END), 0) AS pendingPackages
        FROM Package p
        INNER JOIN Unit u ON u.id = p.unitId
        INNER JOIN Building b ON b.id = u.buildingId
        GROUP BY b.label
        ORDER BY totalPackages DESC, b.label ASC
        LIMIT ${limit}
      `
    : await prisma.$queryRaw<
        Array<{ buildingLabel: string; totalPackages: unknown; pendingPackages: unknown }>
      >`
        SELECT
          b.label AS "buildingLabel",
          COUNT(p.id) AS "totalPackages",
          COALESCE(SUM(CASE WHEN p.status IN ('PENDING', 'NOTIFIED') THEN 1 ELSE 0 END), 0) AS "pendingPackages"
        FROM "Package" p
        INNER JOIN "Unit" u ON u.id = p."unitId"
        INNER JOIN "Building" b ON b.id = u."buildingId"
        GROUP BY b.label
        ORDER BY "totalPackages" DESC, b.label ASC
        LIMIT ${limit}
      `;

  return rows.map((row) => ({
    buildingLabel: row.buildingLabel,
    totalPackages: asNumber(row.totalPackages),
    pendingPackages: asNumber(row.pendingPackages)
  }));
}

export async function getMobileSummaryStats(): Promise<MobileSummaryStats> {
  const today = startOfDay(new Date());
  const overdueLimit = overdueThresholdDate();

  const rows = isSqliteDatasource()
    ? await prisma.$queryRaw<
        Array<{
          pendingCount: unknown;
          notifiedCount: unknown;
          todayCount: unknown;
          pickedUpTodayCount: unknown;
          overdueCount: unknown;
        }>
      >`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0) AS pendingCount,
          COALESCE(SUM(CASE WHEN status = 'NOTIFIED' THEN 1 ELSE 0 END), 0) AS notifiedCount,
          COALESCE(SUM(CASE WHEN receivedAt >= ${today} THEN 1 ELSE 0 END), 0) AS todayCount,
          COALESCE(SUM(CASE WHEN status = 'PICKED_UP' AND pickedUpAt >= ${today} THEN 1 ELSE 0 END), 0) AS pickedUpTodayCount,
          COALESCE(SUM(CASE WHEN status IN ('PENDING', 'NOTIFIED') AND receivedAt < ${overdueLimit} THEN 1 ELSE 0 END), 0) AS overdueCount
        FROM Package
      `
    : await prisma.$queryRaw<
        Array<{
          pendingCount: unknown;
          notifiedCount: unknown;
          todayCount: unknown;
          pickedUpTodayCount: unknown;
          overdueCount: unknown;
        }>
      >`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0) AS "pendingCount",
          COALESCE(SUM(CASE WHEN status = 'NOTIFIED' THEN 1 ELSE 0 END), 0) AS "notifiedCount",
          COALESCE(SUM(CASE WHEN "receivedAt" >= ${today} THEN 1 ELSE 0 END), 0) AS "todayCount",
          COALESCE(SUM(CASE WHEN status = 'PICKED_UP' AND "pickedUpAt" >= ${today} THEN 1 ELSE 0 END), 0) AS "pickedUpTodayCount",
          COALESCE(SUM(CASE WHEN status IN ('PENDING', 'NOTIFIED') AND "receivedAt" < ${overdueLimit} THEN 1 ELSE 0 END), 0) AS "overdueCount"
        FROM "Package"
      `;

  const stats = rows[0];

  return {
    pendingCount: asNumber(stats?.pendingCount),
    notifiedCount: asNumber(stats?.notifiedCount),
    todayCount: asNumber(stats?.todayCount),
    pickedUpTodayCount: asNumber(stats?.pickedUpTodayCount),
    overdueCount: asNumber(stats?.overdueCount)
  };
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
