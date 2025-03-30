/*
  Warnings:

  - You are about to drop the column `end_date` on the `DietPlan` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `DietPlan` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `WorkoutPlan` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `WorkoutPlan` table. All the data in the column will be lost.
  - You are about to drop the `FoodLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutLog` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `date` to the `DietPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by_id` to the `DietPlanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `DietPlanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plan_type` to the `DietPlanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `DietPlanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `WorkoutPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by_id` to the `WorkoutPlanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `WorkoutPlanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plan_type` to the `WorkoutPlanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `WorkoutPlanItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `FoodLog` DROP FOREIGN KEY `FoodLog_food_id_fkey`;

-- DropForeignKey
ALTER TABLE `FoodLog` DROP FOREIGN KEY `FoodLog_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `WorkoutLog` DROP FOREIGN KEY `WorkoutLog_activity_id_fkey`;

-- DropForeignKey
ALTER TABLE `WorkoutLog` DROP FOREIGN KEY `WorkoutLog_user_id_fkey`;

-- AlterTable
ALTER TABLE `DietPlan` DROP COLUMN `end_date`,
    DROP COLUMN `start_date`,
    ADD COLUMN `date` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `DietPlanItem` ADD COLUMN `created_by_id` INTEGER NOT NULL,
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `plan_type` ENUM('AI', 'USER') NOT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `WorkoutPlan` DROP COLUMN `end_date`,
    DROP COLUMN `start_date`,
    ADD COLUMN `date` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `WorkoutPlanItem` ADD COLUMN `created_by_id` INTEGER NOT NULL,
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `plan_type` ENUM('AI', 'USER') NOT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- DropTable
DROP TABLE `FoodLog`;

-- DropTable
DROP TABLE `WorkoutLog`;

-- AddForeignKey
ALTER TABLE `WorkoutPlanItem` ADD CONSTRAINT `WorkoutPlanItem_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkoutPlanItem` ADD CONSTRAINT `WorkoutPlanItem_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DietPlanItem` ADD CONSTRAINT `DietPlanItem_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DietPlanItem` ADD CONSTRAINT `DietPlanItem_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
