-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('PENDING', 'NOTIFIED', 'PICKED_UP', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PackageEventType" AS ENUM ('PACKAGE_RECEIVED', 'PACKAGE_NOTIFIED', 'PACKAGE_PICKED_UP', 'PACKAGE_UPDATED', 'PACKAGE_CANCELLED');

-- CreateEnum
CREATE TYPE "OperatorRole" AS ENUM ('ADMIN', 'FRONT_DESK', 'MANAGER');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "whatsappPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resident" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "OperatorRole" NOT NULL DEFAULT 'FRONT_DESK',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "residentId" TEXT,
    "packageCode" TEXT,
    "carrier" TEXT,
    "labelPhotoUrl" TEXT,
    "status" "PackageStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "pickedUpByName" TEXT,
    "pickedUpByDocument" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "type" "PackageEventType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Building_organizationId_idx" ON "Building"("organizationId");

-- CreateIndex
CREATE INDEX "Building_label_idx" ON "Building"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Building_organizationId_label_key" ON "Building"("organizationId", "label");

-- CreateIndex
CREATE INDEX "Unit_organizationId_idx" ON "Unit"("organizationId");

-- CreateIndex
CREATE INDEX "Unit_buildingId_idx" ON "Unit"("buildingId");

-- CreateIndex
CREATE INDEX "Unit_number_idx" ON "Unit"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_buildingId_number_key" ON "Unit"("buildingId", "number");

-- CreateIndex
CREATE INDEX "Resident_organizationId_idx" ON "Resident"("organizationId");

-- CreateIndex
CREATE INDEX "Resident_unitId_idx" ON "Resident"("unitId");

-- CreateIndex
CREATE INDEX "Resident_phone_idx" ON "Resident"("phone");

-- CreateIndex
CREATE INDEX "Resident_name_idx" ON "Resident"("name");

-- CreateIndex
CREATE INDEX "Resident_isActive_idx" ON "Resident"("isActive");

-- CreateIndex
CREATE INDEX "Resident_isActive_name_idx" ON "Resident"("isActive", "name");

-- CreateIndex
CREATE INDEX "Operator_organizationId_idx" ON "Operator"("organizationId");

-- CreateIndex
CREATE INDEX "Package_organizationId_idx" ON "Package"("organizationId");

-- CreateIndex
CREATE INDEX "Package_unitId_idx" ON "Package"("unitId");

-- CreateIndex
CREATE INDEX "Package_residentId_idx" ON "Package"("residentId");

-- CreateIndex
CREATE INDEX "Package_status_idx" ON "Package"("status");

-- CreateIndex
CREATE INDEX "Package_receivedAt_idx" ON "Package"("receivedAt");

-- CreateIndex
CREATE INDEX "Package_pickedUpAt_idx" ON "Package"("pickedUpAt");

-- CreateIndex
CREATE INDEX "Package_status_receivedAt_idx" ON "Package"("status", "receivedAt");

-- CreateIndex
CREATE INDEX "Package_status_pickedUpAt_idx" ON "Package"("status", "pickedUpAt");

-- CreateIndex
CREATE INDEX "PackageEvent_organizationId_idx" ON "PackageEvent"("organizationId");

-- CreateIndex
CREATE INDEX "PackageEvent_packageId_idx" ON "PackageEvent"("packageId");

-- CreateIndex
CREATE INDEX "PackageEvent_type_idx" ON "PackageEvent"("type");

-- CreateIndex
CREATE INDEX "PackageEvent_createdAt_idx" ON "PackageEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageEvent" ADD CONSTRAINT "PackageEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageEvent" ADD CONSTRAINT "PackageEvent_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
