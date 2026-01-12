-- Insurance Website Database Setup Script
-- Run this in MySQL Workbench or MySQL Command Line

-- Create database
CREATE DATABASE IF NOT EXISTS insurance_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE insurance_db;

-- Verify database created
SELECT DATABASE();

-- Show message
SELECT 'Database insurance_db created successfully!' AS Status;
