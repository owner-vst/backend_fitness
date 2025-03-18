/*
  Warnings:

  - You are about to alter the column `role_name` on the `Role` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `Role` MODIFY `role_name` ENUM('ADMIN', 'USER', 'VENDOR') NOT NULL;
