/*
  Warnings:

  - Made the column `role_id` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_role_id_fkey`;

-- DropIndex
DROP INDEX `User_role_id_fkey` ON `User`;

-- AlterTable
ALTER TABLE `User` MODIFY `role_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
