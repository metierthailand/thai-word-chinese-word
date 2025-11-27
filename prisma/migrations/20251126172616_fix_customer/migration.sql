/*
  Warnings:

  - You are about to drop the column `firstName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `firstNameEn` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstNameTh` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastNameEn` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastNameTh` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Title" AS ENUM ('MR', 'MRS', 'MS', 'OTHER');

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "firstNameEn" TEXT NOT NULL,
ADD COLUMN     "firstNameTh" TEXT NOT NULL,
ADD COLUMN     "lastNameEn" TEXT NOT NULL,
ADD COLUMN     "lastNameTh" TEXT NOT NULL,
ADD COLUMN     "title" "Title";
