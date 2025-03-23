/*
  Warnings:

  - Added the required column `serving_size_gm` to the `FoodCatalogue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `FoodCatalogue` ADD COLUMN `serving_size_gm` DOUBLE NOT NULL;
