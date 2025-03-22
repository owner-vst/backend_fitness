/*
  Warnings:

  - You are about to drop the column `unit` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `calories_burned` on the `WorkoutLog` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `WorkoutLog` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `WorkoutPlanItem` table. All the data in the column will be lost.
  - Added the required column `calories_per_kg` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `WorkoutLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `WorkoutPlanItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Activity` DROP COLUMN `unit`,
    ADD COLUMN `calories_per_kg` DOUBLE NOT NULL,
    ADD COLUMN `duration` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `WorkoutLog` DROP COLUMN `calories_burned`,
    DROP COLUMN `quantity`,
    ADD COLUMN `duration` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `WorkoutPlanItem` DROP COLUMN `quantity`,
    ADD COLUMN `duration` INTEGER NOT NULL;
