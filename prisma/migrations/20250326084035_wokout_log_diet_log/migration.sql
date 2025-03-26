/*
  Warnings:

  - Added the required column `meal_type` to the `FoodLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `FoodLog` ADD COLUMN `meal_type` ENUM('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK') NOT NULL,
    ADD COLUMN `status` ENUM('PENDING', 'COMPLETED', 'SKIPPED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `WorkoutLog` ADD COLUMN `status` ENUM('PENDING', 'COMPLETED', 'SKIPPED') NOT NULL DEFAULT 'PENDING';
