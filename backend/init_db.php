<?php
/**
 * Database Initializer for Chettinad Express Car Booking
 * Creates MySQL database 'car_booking' and required tables.
 */

$host = '127.0.0.1';
$port = '3306';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host={$host};port={$port}", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `car_booking` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `car_booking`");
    echo "Using database `car_booking`\n";

    // 1. Users Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `email` VARCHAR(255) NOT NULL UNIQUE,
        `email_verified_at` TIMESTAMP NULL,
        `password` VARCHAR(255) NOT NULL,
        `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
        `remember_token` VARCHAR(100) NULL,
        `created_at` TIMESTAMP NULL,
        `updated_at` TIMESTAMP NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 2. Personal Access Tokens (Sanctum)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `tokenable_type` VARCHAR(255) NOT NULL,
        `tokenable_id` BIGINT UNSIGNED NOT NULL,
        `name` VARCHAR(255) NOT NULL,
        `token` VARCHAR(64) NOT NULL UNIQUE,
        `abilities` TEXT NULL,
        `last_used_at` TIMESTAMP NULL,
        `expires_at` TIMESTAMP NULL,
        `created_at` TIMESTAMP NULL,
        `updated_at` TIMESTAMP NULL,
        INDEX `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 3. Banner Activation Locks
    $pdo->exec("CREATE TABLE IF NOT EXISTS `banner_activation_locks` (
        `id` TINYINT UNSIGNED PRIMARY KEY
    ) ENGINE=InnoDB;");
    $pdo->exec("INSERT IGNORE INTO `banner_activation_locks` (`id`) VALUES (1);");

    // 4. Banners Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `banners` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(255) NOT NULL,
        `from_city` VARCHAR(255) NOT NULL DEFAULT 'Chennai',
        `to_city` VARCHAR(255) NOT NULL DEFAULT 'Madurai',
        `vehicle_type` VARCHAR(255) NOT NULL DEFAULT 'Sedan (Dzire / Etios)',
        `available_vehicles` TEXT NULL,
        `trip_type` VARCHAR(50) NOT NULL DEFAULT 'One Way',
        `banner_image` VARCHAR(255) NOT NULL,
        `actual_price` DECIMAL(12, 2) NOT NULL,
        `offer_price` DECIMAL(12, 2) NOT NULL,
        `from_date` DATE NOT NULL,
        `to_date` DATE NOT NULL,
        `quotation_ref` VARCHAR(100) NOT NULL DEFAULT 'QT-SPECIAL',
        `quotation_details` TEXT NULL,
        `is_active` TINYINT(1) NOT NULL DEFAULT 0,
        `created_by` BIGINT UNSIGNED NULL,
        `created_at` TIMESTAMP NULL,
        `updated_at` TIMESTAMP NULL,
        INDEX `banners_is_active_from_date_to_date_index` (`is_active`, `from_date`, `to_date`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 5. Bookings / Quotation Orders Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `bookings` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `customer_name` VARCHAR(255) NOT NULL,
        `phone` VARCHAR(50) NOT NULL,
        `pickup` VARCHAR(255) NOT NULL,
        `drop_location` VARCHAR(255) NOT NULL,
        `vehicle` VARCHAR(255) NOT NULL,
        `trip_type` VARCHAR(50) NOT NULL,
        `booking_date` VARCHAR(50) NULL,
        `booking_time` VARCHAR(50) NULL,
        `estimated_fare` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        `offer_code` VARCHAR(100) NULL,
        `offer_price` DECIMAL(12, 2) NULL,
        `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
        `source` VARCHAR(100) NOT NULL DEFAULT 'Direct',
        `notes` TEXT NULL,
        `created_at` TIMESTAMP NULL,
        `updated_at` TIMESTAMP NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 6. Login History / Security Audit Logs
    $pdo->exec("CREATE TABLE IF NOT EXISTS `login_logs` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `email` VARCHAR(255) NOT NULL,
        `ip` VARCHAR(100) NOT NULL,
        `user_agent` TEXT NULL,
        `status` VARCHAR(50) NOT NULL,
        `message` VARCHAR(255) NOT NULL,
        `created_at` TIMESTAMP NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Seed default Admin User if not exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM `users` WHERE `email` = ?");
    $stmt->execute(['admin@example.com']);
    if ($stmt->fetchColumn() == 0) {
        $hashed = password_hash('admin123', PASSWORD_BCRYPT);
        $insert = $pdo->prepare("INSERT INTO `users` (`name`, `email`, `password`, `is_admin`, `created_at`, `updated_at`) VALUES (?, ?, ?, 1, NOW(), NOW())");
        $insert->execute(['Banner Admin', 'admin@example.com', $hashed]);
        echo "Created default admin user: admin@example.com / admin123\n";
    }

    // Seed initial banners if table is empty
    $count = $pdo->query("SELECT COUNT(*) FROM `banners`")->fetchColumn();
    if ($count == 0) {
        $adminId = $pdo->query("SELECT id FROM users WHERE email = 'admin@example.com'")->fetchColumn();
        $today = date('Y-m-d');
        $inTwoWeeks = date('Y-m-d', strtotime('+14 days'));
        $inMonth = date('Y-m-d', strtotime('+30 days'));

        $stmt = $pdo->prepare("INSERT INTO `banners` 
            (`title`, `from_city`, `to_city`, `vehicle_type`, `available_vehicles`, `trip_type`, `banner_image`, `actual_price`, `offer_price`, `from_date`, `to_date`, `quotation_ref`, `quotation_details`, `is_active`, `created_by`, `created_at`, `updated_at`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");

        $stmt->execute([
            'Chennai to Madurai Special Drop Fare',
            'Chennai',
            'Madurai',
            'Sedan (Dzire / Etios)',
            json_encode(['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta']),
            'One Way',
            '/images/special-offer-banner.jpg',
            6500.00,
            4999.00,
            $today,
            $inTwoWeeks,
            'QT-CHM-2026',
            'All-inclusive one-way drop taxi fare with driver bata and toll allowance.',
            1, // Active!
            $adminId
        ]);

        $stmt->execute([
            'Coimbatore to Ooty Hill Station Tour Offer',
            'Coimbatore',
            'Ooty',
            'SUV (Ertiga)',
            json_encode(['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta']),
            'Round Trip',
            '/images/special-offer-banner.jpg',
            5200.00,
            3899.00,
            $today,
            $inMonth,
            'QT-CBE-OOTY',
            'Includes hill permit, fuel, toll, and experienced ghat driver.',
            1, // Active!
            $adminId
        ]);

        $stmt->execute([
            'Bangalore to Chennai Executive Highway Ride',
            'Bangalore',
            'Chennai',
            'Innova Crysta',
            json_encode(['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta']),
            'One Way',
            '/images/special-offer-banner.jpg',
            7800.00,
            6200.00,
            $today,
            $inTwoWeeks,
            'QT-BLR-CHN',
            'Doorstep pickup, highway expressway route, free waiting 30 mins.',
            0, // Inactive / Draft (Requires Admin Approval!)
            $adminId
        ]);

        echo "Seeded initial offer banners.\n";
    }

    echo "Database setup completed successfully!\n";
} catch (Exception $e) {
    echo "Database error: " . $e->getMessage() . "\n";
    exit(1);
}
