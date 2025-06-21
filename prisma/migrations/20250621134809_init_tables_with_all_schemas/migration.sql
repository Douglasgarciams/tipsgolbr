-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `subscriptionStatus` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE',
    `subscriptionExpiresAt` DATETIME(3) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Palpite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `esporte` VARCHAR(191) NOT NULL DEFAULT 'Futebol',
    `competicao` VARCHAR(191) NOT NULL,
    `jogo` VARCHAR(191) NOT NULL,
    `dataHora` DATETIME(3) NOT NULL,
    `palpite` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `oddpesquisada` DOUBLE NULL,
    `resultado` ENUM('PENDING', 'GREEN', 'RED') NOT NULL DEFAULT 'PENDING',
    `placar` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApostaFeita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `valorApostado` DOUBLE NOT NULL,
    `resultadoPNL` DOUBLE NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` INTEGER NOT NULL,
    `palpiteId` INTEGER NOT NULL,

    UNIQUE INDEX `ApostaFeita_usuarioId_palpiteId_key`(`usuarioId`, `palpiteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
