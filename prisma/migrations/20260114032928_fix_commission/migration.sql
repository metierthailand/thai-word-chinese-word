/*
  Warnings:

  - You are about to drop the column `rate` on the `Commission` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Commission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Commission" DROP COLUMN "rate",
DROP COLUMN "type";

-- DropEnum
DROP TYPE "CommissionType";
