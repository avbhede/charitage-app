-- Charitage Foundation MySQL Schema
-- Character set: utf8mb4

CREATE DATABASE IF NOT EXISTS `charitage` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `charitage`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) DEFAULT NULL,
    `pan` VARCHAR(50) DEFAULT NULL,
    `role` VARCHAR(50) DEFAULT 'donor',
    `hashed_password` VARCHAR(255) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Campaigns Table
CREATE TABLE IF NOT EXISTS `campaigns` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `goal_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `raised_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `image_url` TEXT,
    `status` VARCHAR(50) DEFAULT 'active',
    `beneficiaries_count` INT DEFAULT 0,
    `submitted_by` VARCHAR(64) DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_campaigns_status` (`status`),
    INDEX `idx_campaigns_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Donations Table
CREATE TABLE IF NOT EXISTS `donations` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `user_id` VARCHAR(64) DEFAULT NULL,
    `campaign_id` VARCHAR(64) DEFAULT NULL,
    `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `tip_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `donor_name` VARCHAR(255) NOT NULL,
    `donor_email` VARCHAR(191) NOT NULL,
    `donor_phone` VARCHAR(50) DEFAULT NULL,
    `donor_pan` VARCHAR(50) DEFAULT NULL,
    `gift_address` TEXT DEFAULT NULL,
    `is_anonymous` TINYINT(1) DEFAULT 0,
    `is_recurring` TINYINT(1) DEFAULT 0,
    `duration_months` INT DEFAULT 12,
    `razorpay_order_id` VARCHAR(100) DEFAULT NULL,
    `razorpay_payment_id` VARCHAR(100) DEFAULT NULL,
    `razorpay_subscription_id` VARCHAR(100) DEFAULT NULL,
    `razorpay_signature` VARCHAR(255) DEFAULT NULL,
    `receipt_url` VARCHAR(255) DEFAULT NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_donations_status` (`status`),
    INDEX `idx_donations_campaign` (`campaign_id`),
    INDEX `idx_donations_user` (`user_id`),
    INDEX `idx_donations_order` (`razorpay_order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Volunteers Table
CREATE TABLE IF NOT EXISTS `volunteers` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(50) DEFAULT NULL,
    `city` VARCHAR(100) DEFAULT NULL,
    `occupation` VARCHAR(100) DEFAULT NULL,
    `interests` TEXT DEFAULT NULL,
    `availability` VARCHAR(100) DEFAULT NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_volunteers_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Inquiries Table
CREATE TABLE IF NOT EXISTS `inquiries` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(50) DEFAULT NULL,
    `company_name` VARCHAR(255) DEFAULT NULL,
    `area_of_interest` VARCHAR(100) DEFAULT NULL,
    `subject` VARCHAR(255) DEFAULT NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(50) DEFAULT 'new',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Memberships Table
CREATE TABLE IF NOT EXISTS `memberships` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(50) DEFAULT NULL,
    `pan` VARCHAR(50) DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `membership_type` VARCHAR(100) DEFAULT 'Annual',
    `amount` DECIMAL(12,2) DEFAULT 0.00,
    `razorpay_payment_id` VARCHAR(100) DEFAULT NULL,
    `status` VARCHAR(50) DEFAULT 'active',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Blogs Table
CREATE TABLE IF NOT EXISTS `blogs` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(191) NOT NULL UNIQUE,
    `excerpt` TEXT,
    `content` LONGTEXT,
    `author` VARCHAR(100) DEFAULT 'Charitage Team',
    `image_url` TEXT,
    `category` VARCHAR(100) DEFAULT 'General',
    `tags` JSON DEFAULT NULL,
    `published` TINYINT(1) DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_blogs_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Activities Table
CREATE TABLE IF NOT EXISTS `activities` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `category` VARCHAR(100) DEFAULT 'Community',
    `media_type` VARCHAR(50) DEFAULT 'image',
    `media_url` TEXT,
    `gallery_urls` JSON DEFAULT NULL,
    `event_date` VARCHAR(100) DEFAULT NULL,
    `location` VARCHAR(255) DEFAULT NULL,
    `participants_count` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Stories Table
CREATE TABLE IF NOT EXISTS `stories` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `featured_image` TEXT,
    `category` VARCHAR(100) DEFAULT 'Impact Story',
    `author` VARCHAR(100) DEFAULT 'Charitage Team',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. News Table
CREATE TABLE IF NOT EXISTS `news` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `excerpt` TEXT,
    `content` LONGTEXT,
    `image_url` TEXT,
    `video_url` TEXT DEFAULT NULL,
    `category` VARCHAR(100) DEFAULT 'Press Release',
    `tags` JSON DEFAULT NULL,
    `author` VARCHAR(100) DEFAULT 'Charitage News Desk',
    `published_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Gallery Table
CREATE TABLE IF NOT EXISTS `gallery` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `type` VARCHAR(50) DEFAULT 'image',
    `url` TEXT NOT NULL,
    `thumbnail_url` TEXT DEFAULT NULL,
    `category` VARCHAR(100) DEFAULT 'Events',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Team Table
CREATE TABLE IF NOT EXISTS `team` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `role` VARCHAR(100) NOT NULL,
    `bio` TEXT,
    `image_url` TEXT,
    `social_links` JSON DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Documents Table
CREATE TABLE IF NOT EXISTS `documents` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) DEFAULT 'Annual Report',
    `file_url` TEXT NOT NULL,
    `description` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
