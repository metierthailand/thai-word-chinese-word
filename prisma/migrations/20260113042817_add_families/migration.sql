/*
  Warnings:

  - You are about to drop the column `nickname` on the `Customer` table. All the data in the column will be lost.
  - Made the column `dateOfBirth` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "nickname",
ALTER COLUMN "dateOfBirth" SET NOT NULL,
ALTER COLUMN "firstNameTh" DROP NOT NULL,
ALTER COLUMN "lastNameTh" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "lineId" TEXT,
    "email" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerFamily" (
    "customerId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerFamily_pkey" PRIMARY KEY ("customerId","familyId")
);

-- AddForeignKey
ALTER TABLE "CustomerFamily" ADD CONSTRAINT "CustomerFamily_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerFamily" ADD CONSTRAINT "CustomerFamily_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
