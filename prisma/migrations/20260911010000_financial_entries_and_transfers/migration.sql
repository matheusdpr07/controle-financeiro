CREATE TABLE `financial_entry` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `financialAccountId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `kind` ENUM('INCOME', 'EXPENSE') NOT NULL,
    `description` VARCHAR(120) NOT NULL,
    `amount` DECIMAL(19, 2) NOT NULL,
    `occurredOn` DATE NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    CONSTRAINT `financial_entry_amount_positive` CHECK (`amount` > 0),
    INDEX `financial_entry_userId_occurredOn_deletedAt_idx`(`userId`, `occurredOn`, `deletedAt`),
    INDEX `financial_entry_financialAccountId_occurredOn_idx`(`financialAccountId`, `occurredOn`),
    INDEX `financial_entry_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `financial_transfer` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `sourceAccountId` VARCHAR(191) NOT NULL,
    `destinationAccountId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(120) NOT NULL,
    `amount` DECIMAL(19, 2) NOT NULL,
    `occurredOn` DATE NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    CONSTRAINT `financial_transfer_amount_positive` CHECK (`amount` > 0),
    INDEX `financial_transfer_userId_occurredOn_deletedAt_idx`(`userId`, `occurredOn`, `deletedAt`),
    INDEX `financial_transfer_sourceAccountId_occurredOn_idx`(`sourceAccountId`, `occurredOn`),
    INDEX `financial_transfer_destinationAccountId_occurredOn_idx`(`destinationAccountId`, `occurredOn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `financial_entry` ADD CONSTRAINT `financial_entry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `financial_entry` ADD CONSTRAINT `financial_entry_financialAccountId_fkey` FOREIGN KEY (`financialAccountId`) REFERENCES `financial_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `financial_entry` ADD CONSTRAINT `financial_entry_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `financial_transfer` ADD CONSTRAINT `financial_transfer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `financial_transfer` ADD CONSTRAINT `financial_transfer_sourceAccountId_fkey` FOREIGN KEY (`sourceAccountId`) REFERENCES `financial_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `financial_transfer` ADD CONSTRAINT `financial_transfer_destinationAccountId_fkey` FOREIGN KEY (`destinationAccountId`) REFERENCES `financial_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
