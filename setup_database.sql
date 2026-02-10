-- setup_database.sql

-- Create Database
CREATE DATABASE IF NOT EXISTS medical_lab;
USE medical_lab;

-- Create Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Insert a dummy record for testing
INSERT INTO appointments (name, phone, test_type, appointment_date, appointment_time, message)
VALUES ('Test User', '9800000000', 'blood', CURDATE(), '10:00:00', 'This is a test booking.');
