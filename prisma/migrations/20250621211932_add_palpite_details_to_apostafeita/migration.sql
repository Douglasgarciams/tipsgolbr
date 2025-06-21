-- AlterTable
ALTER TABLE `ApostaFeita` ADD COLUMN `palpiteCompeticao` VARCHAR(191) NULL,
    ADD COLUMN `palpiteJogo` VARCHAR(191) NULL,
    ADD COLUMN `palpiteLink` VARCHAR(191) NULL,
    ADD COLUMN `palpiteMetodo` VARCHAR(191) NULL,
    ADD COLUMN `palpiteOdds` DOUBLE NULL;
