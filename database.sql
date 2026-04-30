-- Create database for ShopWeb
CREATE DATABASE IF NOT EXISTS `shop_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `shop_db`;

-- Users Table (Customers and Staff)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
  `phone` VARCHAR(20),
  `address` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT
);

-- Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(12,2) NOT NULL,
  `stock_quantity` INT DEFAULT 0,
  `image_url` VARCHAR(255),
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  `shipping_address` TEXT NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'COD',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price_at_time` DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- Insert Sample Data
INSERT INTO `categories` (`name`, `description`) VALUES 
('Laptops', 'Gaming and Work laptops'),
('Smartphones', 'Latest mobile devices'),
('Accessories', 'Mice, Keyboards, and more');

INSERT INTO `products` (`category_id`, `name`, `description`, `price`, `stock_quantity`, `image_url`) VALUES 
(1, 'ASUS ROG Zephyrus', 'High-end gaming laptop', 35000000.00, 10, 'https://via.placeholder.com/300'),
(2, 'iPhone 15 Pro', 'Titanium design, A17 Pro chip', 28000000.00, 15, 'https://via.placeholder.com/300'),
(3, 'Logitech MX Master 3S', 'Ergonomic wireless mouse', 2500000.00, 50, 'https://via.placeholder.com/300');

-- Default Admin/Staff Account
-- Password is 'password' hashed with bcrypt
INSERT INTO `users` (`name`, `email`, `password`, `role`) 
VALUES ('Shop Admin', 'admin@shop.com', '$2b$10$Ovk0fG0Vxy.h7Z1rE.S8x.1C1B1oO90P1vL0R2bL71e9K0T1D4n9q', 'admin');
