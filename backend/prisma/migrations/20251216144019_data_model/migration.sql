/*
  Warnings:

  - You are about to alter the column `role` on the `admins` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.
  - You are about to drop the `admin_addresses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admin_payment_info` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `superadmin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `admin_addresses` DROP FOREIGN KEY `admin_addresses_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `admin_payment_info` DROP FOREIGN KEY `admin_payment_info_adminId_fkey`;

-- AlterTable
ALTER TABLE `admins` MODIFY `role` ENUM('Admin', 'Reseller', 'Subscriber') NOT NULL DEFAULT 'Admin';

-- DropTable
DROP TABLE `admin_addresses`;

-- DropTable
DROP TABLE `admin_payment_info`;

-- DropTable
DROP TABLE `superadmin`;

-- CreateTable
CREATE TABLE `addresses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `thana` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `division` VARCHAR(191) NOT NULL,
    `houseName` VARCHAR(191) NULL,
    `street` VARCHAR(191) NULL,
    `adminId` VARCHAR(191) NULL,
    `resellerId` VARCHAR(191) NULL,
    `subscriberId` VARCHAR(191) NULL,

    UNIQUE INDEX `addresses_adminId_key`(`adminId`),
    UNIQUE INDEX `addresses_resellerId_key`(`resellerId`),
    UNIQUE INDEX `addresses_subscriberId_key`(`subscriberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monthlyFee` DOUBLE NOT NULL DEFAULT 0,
    `lastPaymentDate` DATETIME(3) NULL,
    `nextPaymentDue` DATETIME(3) NULL,
    `paymentStatus` ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'DUE') NOT NULL DEFAULT 'PENDING',
    `adminId` VARCHAR(191) NULL,
    `resellerId` VARCHAR(191) NULL,
    `subscriberId` VARCHAR(191) NULL,

    UNIQUE INDEX `payment_info_adminId_key`(`adminId`),
    UNIQUE INDEX `payment_info_resellerId_key`(`resellerId`),
    UNIQUE INDEX `payment_info_subscriberId_key`(`subscriberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `super_admins` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `refreshToken` TEXT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'SuperAdmin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `super_admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resellers` (
    `id` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NOT NULL,
    `nid` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `status` ENUM('Active', 'Inactive', 'Suspended') NOT NULL DEFAULT 'Active',
    `refreshToken` TEXT NULL,
    `role` ENUM('Admin', 'Reseller', 'Subscriber') NOT NULL DEFAULT 'Reseller',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `resellers_username_key`(`username`),
    UNIQUE INDEX `resellers_email_key`(`email`),
    INDEX `resellers_adminId_idx`(`adminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscribers` (
    `id` VARCHAR(191) NOT NULL,
    `resellerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NOT NULL,
    `nid` VARCHAR(191) NOT NULL,
    `clientType` ENUM('home', 'corporate') NOT NULL DEFAULT 'home',
    `connectionType` ENUM('shared', 'dedicated') NOT NULL DEFAULT 'shared',
    `service` ENUM('pppoe', 'hotspot', 'dhcp', 'static') NOT NULL DEFAULT 'pppoe',
    `macAddress` VARCHAR(191) NULL DEFAULT '',
    `packageId` VARCHAR(191) NOT NULL,
    `packageName` VARCHAR(191) NULL,
    `routerId` VARCHAR(191) NOT NULL,
    `isEnableOnRouter` BOOLEAN NOT NULL DEFAULT false,
    `lastSyncAt` DATETIME(3) NULL,
    `syncStatus` ENUM('synced', 'notSynced') NOT NULL DEFAULT 'notSynced',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Router` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `assignedForId` VARCHAR(191) NULL,
    `host` VARCHAR(191) NOT NULL,
    `port` INTEGER NOT NULL DEFAULT 8728,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `apiType` ENUM('api', 'ssl_api') NOT NULL DEFAULT 'api',
    `identity` VARCHAR(191) NOT NULL DEFAULT '',
    `version` VARCHAR(191) NOT NULL DEFAULT '',
    `board` VARCHAR(191) NOT NULL DEFAULT '',
    `uptime` VARCHAR(191) NOT NULL DEFAULT '',
    `vlanId` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `lastSeen` DATETIME(3) NULL,
    `lastSyncAt` DATETIME(3) NULL,
    `syncError` VARCHAR(191) NOT NULL DEFAULT '',
    `notes` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Router_username_key`(`username`),
    INDEX `Router_ownerId_idx`(`ownerId`),
    INDEX `Router_assignedForId_idx`(`assignedForId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packages` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `resellerId` VARCHAR(191) NOT NULL,
    `routerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `remoteAddress` VARCHAR(191) NOT NULL,
    `localAddress` VARCHAR(191) NOT NULL,
    `onlyOne` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
    `rateLimit` VARCHAR(191) NOT NULL DEFAULT '',
    `price` DOUBLE NOT NULL DEFAULT 0,
    `billingCycle` ENUM('monthly', 'yearly', 'custom') NOT NULL DEFAULT 'monthly',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(191) NOT NULL DEFAULT '',
    `sessionTimeout` VARCHAR(191) NOT NULL DEFAULT '0',
    `idleTimeout` VARCHAR(191) NOT NULL DEFAULT '0',
    `syncStatus` ENUM('synced', 'pending', 'failed', 'notSynced') NOT NULL DEFAULT 'synced',
    `lastSyncAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `packages_routerId_idx`(`routerId`),
    INDEX `packages_ownerId_idx`(`ownerId`),
    UNIQUE INDEX `packages_resellerId_name_key`(`resellerId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_plans` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `billingCycle` ENUM('monthly', 'yearly', 'custom') NOT NULL,
    `maxResellers` INTEGER NOT NULL,
    `maxUsers` INTEGER NOT NULL,
    `maxRouters` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscription_plans_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'active', 'expired', 'cancelled') NOT NULL DEFAULT 'pending',
    `priceAtPurchase` DOUBLE NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `admin_subscriptions_planId_idx`(`planId`),
    UNIQUE INDEX `admin_subscriptions_adminId_key`(`adminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `payerType` ENUM('Admin', 'Reseller') NOT NULL,
    `adminPayerId` VARCHAR(191) NULL,
    `resellerPayerId` VARCHAR(191) NULL,
    `receiverType` ENUM('Admin', 'SuperAdmin') NOT NULL,
    `adminReceiverId` VARCHAR(191) NULL,
    `superAdminReceiverId` VARCHAR(191) NULL,
    `adminSubscriptionId` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `paymentMethod` ENUM('bkash', 'nagad', 'manual') NOT NULL DEFAULT 'manual',
    `paymentMethodRef` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'DUE') NOT NULL DEFAULT 'PENDING',
    `notes` VARCHAR(191) NULL,
    `confirmedBySuperAdminId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `payments_status_idx`(`status`),
    INDEX `payments_payerType_idx`(`payerType`),
    INDEX `payments_receiverType_idx`(`receiverType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_packages` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `userCount` INTEGER NOT NULL DEFAULT 0,
    `subtotal` DOUBLE NOT NULL,

    INDEX `payment_packages_paymentId_idx`(`paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallets` (
    `id` VARCHAR(191) NOT NULL,
    `resellerId` VARCHAR(191) NOT NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'BDT',
    `lastTopUp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastBilling` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lowBalanceThreshold` DOUBLE NOT NULL DEFAULT 3000,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wallets_resellerId_key`(`resellerId`),
    INDEX `wallets_isActive_idx`(`isActive`),
    INDEX `wallets_balance_idx`(`balance`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `walletId` VARCHAR(191) NOT NULL,
    `resellerId` VARCHAR(191) NOT NULL,
    `createdByAdminId` VARCHAR(191) NOT NULL,
    `processedByAdminId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `type` ENUM('RECHARGE', 'WITHDRAW') NOT NULL,
    `paymentMethod` ENUM('CASH', 'BKASH', 'NAGAD', 'BANK', 'MANUAL') NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `transactionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `wallet_transactions_resellerId_transactionDate_idx`(`resellerId`, `transactionDate`),
    INDEX `wallet_transactions_status_transactionDate_idx`(`status`, `transactionDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notices` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `noticeFor` ENUM('ADMIN', 'RESELLER', 'GLOBAL') NOT NULL DEFAULT 'GLOBAL',
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `notices_noticeFor_idx`(`noticeFor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_resellerId_fkey` FOREIGN KEY (`resellerId`) REFERENCES `resellers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_subscriberId_fkey` FOREIGN KEY (`subscriberId`) REFERENCES `subscribers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_info` ADD CONSTRAINT `payment_info_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_info` ADD CONSTRAINT `payment_info_resellerId_fkey` FOREIGN KEY (`resellerId`) REFERENCES `resellers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_info` ADD CONSTRAINT `payment_info_subscriberId_fkey` FOREIGN KEY (`subscriberId`) REFERENCES `subscribers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resellers` ADD CONSTRAINT `resellers_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscribers` ADD CONSTRAINT `subscribers_routerId_fkey` FOREIGN KEY (`routerId`) REFERENCES `Router`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscribers` ADD CONSTRAINT `subscribers_resellerId_fkey` FOREIGN KEY (`resellerId`) REFERENCES `resellers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Router` ADD CONSTRAINT `Router_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Router` ADD CONSTRAINT `Router_assignedForId_fkey` FOREIGN KEY (`assignedForId`) REFERENCES `resellers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_resellerId_fkey` FOREIGN KEY (`resellerId`) REFERENCES `resellers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_routerId_fkey` FOREIGN KEY (`routerId`) REFERENCES `Router`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_subscriptions` ADD CONSTRAINT `admin_subscriptions_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_subscriptions` ADD CONSTRAINT `admin_subscriptions_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `subscription_plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_adminPayerId_fkey` FOREIGN KEY (`adminPayerId`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_resellerPayerId_fkey` FOREIGN KEY (`resellerPayerId`) REFERENCES `resellers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_adminReceiverId_fkey` FOREIGN KEY (`adminReceiverId`) REFERENCES `admins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_superAdminReceiverId_fkey` FOREIGN KEY (`superAdminReceiverId`) REFERENCES `super_admins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_adminSubscriptionId_fkey` FOREIGN KEY (`adminSubscriptionId`) REFERENCES `admin_subscriptions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_confirmedBySuperAdminId_fkey` FOREIGN KEY (`confirmedBySuperAdminId`) REFERENCES `super_admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_packages` ADD CONSTRAINT `payment_packages_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_packages` ADD CONSTRAINT `payment_packages_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `packages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_resellerId_fkey` FOREIGN KEY (`resellerId`) REFERENCES `resellers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `wallets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_resellerId_fkey` FOREIGN KEY (`resellerId`) REFERENCES `resellers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_createdByAdminId_fkey` FOREIGN KEY (`createdByAdminId`) REFERENCES `admins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_processedByAdminId_fkey` FOREIGN KEY (`processedByAdminId`) REFERENCES `admins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notices` ADD CONSTRAINT `notices_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `super_admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
