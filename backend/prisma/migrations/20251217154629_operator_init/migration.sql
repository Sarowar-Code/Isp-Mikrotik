-- CreateTable
CREATE TABLE `admin_operators` (
    `id` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `status` ENUM('Active', 'Inactive', 'Suspended') NOT NULL DEFAULT 'Active',
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_operators_email_key`(`email`),
    INDEX `admin_operators_adminId_idx`(`adminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_operator_permissions` (
    `id` VARCHAR(191) NOT NULL,
    `adminOperatorId` VARCHAR(191) NOT NULL,
    `permission` ENUM('VIEW_RESELLER', 'UPDATE_RESELLER_PROFILE', 'SUSPEND_RESELLER', 'VIEW_SUBSCRIBER', 'CREATE_SUBSCRIBER', 'UPDATE_SUBSCRIBER', 'DISCONNECT_SUBSCRIBER', 'VIEW_ROUTER', 'SYNC_ROUTER', 'VIEW_ONU', 'DISABLE_ONU', 'VIEW_PAYMENT', 'CREATE_PAYMENT', 'CONFIRM_PAYMENT', 'VIEW_WALLET', 'RECHARGE_WALLET', 'VIEW_REPORT') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `admin_operator_permissions_adminOperatorId_idx`(`adminOperatorId`),
    UNIQUE INDEX `admin_operator_permissions_adminOperatorId_permission_key`(`adminOperatorId`, `permission`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_operators` ADD CONSTRAINT `admin_operators_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_operator_permissions` ADD CONSTRAINT `admin_operator_permissions_adminOperatorId_fkey` FOREIGN KEY (`adminOperatorId`) REFERENCES `admin_operators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
