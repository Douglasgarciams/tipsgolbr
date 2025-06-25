/*
  Warnings:

  - The values [LAY_GOLEADA] on the enum `Palpite_metodoAposta` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Palpite` MODIFY `metodoAposta` ENUM('LAY_0X1', 'LAY_0X2', 'LAY_0X3', 'LAY_GOLEADACASA', 'LAY_GOLEADAVISITANTE', 'LAY_1X2', 'LAY_1X0', 'LAY_2X0', 'LAY_3X0', 'BACK_GOLEADA', 'BACK_CASA', 'BACK_VISITANTE', 'LAY_CASA', 'LAY_VISITANTE', 'OVER_0_5HT', 'OVER_1_5HT', 'OVER_2_5HT', 'OVER_3_5HT', 'OVER_0_5FT', 'OVER_1_5FT', 'OVER_2_5FT', 'OVER_3_5FT', 'OVER_4_5FT', 'OVER_5_5FT', 'OVER_6_5FT', 'OVER_7_5FT', 'UNDER_0_5FT', 'UNDER_1_5FT', 'UNDER_2_5FT', 'UNDER_3_5FT', 'UNDER_4_5FT', 'UNDER_5_5FT', 'UNDER_6_5FT', 'UNDER_7_5FT', 'UNDER_0_5HT', 'UNDER_1_5HT', 'UNDER_2_5HT', 'UNDER_3_5HT', 'UNDER_4_5HT', 'BACK_DUPLA_CHANCE', 'LAY_DUPLA_CHANCE') NULL;
