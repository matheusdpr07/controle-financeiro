ALTER TABLE `financial_entry` DROP FOREIGN KEY `financial_entry_financialAccountId_fkey`;

ALTER TABLE `financial_transfer` DROP FOREIGN KEY `financial_transfer_sourceAccountId_fkey`;

ALTER TABLE `financial_transfer` DROP FOREIGN KEY `financial_transfer_destinationAccountId_fkey`;

ALTER TABLE `financial_entry` ADD CONSTRAINT `financial_entry_financialAccountId_fkey` FOREIGN KEY (`financialAccountId`) REFERENCES `financial_account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `financial_transfer` ADD CONSTRAINT `financial_transfer_sourceAccountId_fkey` FOREIGN KEY (`sourceAccountId`) REFERENCES `financial_account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `financial_transfer` ADD CONSTRAINT `financial_transfer_destinationAccountId_fkey` FOREIGN KEY (`destinationAccountId`) REFERENCES `financial_account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
