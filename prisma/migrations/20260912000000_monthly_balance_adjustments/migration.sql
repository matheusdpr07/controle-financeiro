CREATE TABLE `balance_adjustment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `financialAccountId` VARCHAR(191) NOT NULL,
    `month` DATE NOT NULL,
    `expectedBalance` DECIMAL(19, 2) NOT NULL,
    `actualBalance` DECIMAL(19, 2) NOT NULL,
    `amount` DECIMAL(19, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `balance_adjustment_userId_month_idx`(`userId`, `month`),
    UNIQUE INDEX `balance_adjustment_financialAccountId_month_key`(`financialAccountId`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `balance_adjustment` ADD CONSTRAINT `balance_adjustment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `balance_adjustment` ADD CONSTRAINT `balance_adjustment_financialAccountId_fkey` FOREIGN KEY (`financialAccountId`) REFERENCES `financial_account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
