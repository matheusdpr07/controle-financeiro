-- CreateTable
CREATE TABLE `financial_account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('CHECKING', 'SAVINGS', 'CASH', 'INVESTMENT', 'OTHER') NOT NULL,
    `currencyCode` CHAR(3) NOT NULL DEFAULT 'BRL',
    `openingBalance` DECIMAL(19, 2) NOT NULL DEFAULT 0,
    `openingBalanceDate` DATE NOT NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `financial_account_userId_archivedAt_idx`(`userId`, `archivedAt`),
    UNIQUE INDEX `financial_account_userId_name_key`(`userId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `kind` ENUM('INCOME', 'EXPENSE') NOT NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `category_userId_kind_archivedAt_idx`(`userId`, `kind`, `archivedAt`),
    UNIQUE INDEX `category_userId_kind_name_key`(`userId`, `kind`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `financial_account` ADD CONSTRAINT `financial_account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category` ADD CONSTRAINT `category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
