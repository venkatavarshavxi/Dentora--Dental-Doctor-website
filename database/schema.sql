-- Dentora Dental Studio — MySQL Relational Database Schema
-- Import this file in MySQL Workbench, phpMyAdmin, or via CLI:
--   mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS dentora_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dentora_db;

-- 1. Doctors / Dental Specialists Table
CREATE TABLE doctors (
  id VARCHAR(40) PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  role VARCHAR(120) NOT NULL,
  credentials VARCHAR(120) NOT NULL,
  experience_years INT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 5.0,
  availability VARCHAR(120) NOT NULL,
  bio TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Dental Treatments Table
CREATE TABLE treatments (
  id VARCHAR(40) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  category ENUM('Preventive', 'Cosmetic', 'Implants & Ortho') NOT NULL,
  duration VARCHAR(40) NOT NULL,
  summary TEXT NOT NULL,
  recommended_doctor_id VARCHAR(40),
  FOREIGN KEY (recommended_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- 3. Patient Appointments Table (Includes Visit Type, Urgency, Age, Reminder, & Double-Booking Guard)
CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_name VARCHAR(120) NOT NULL,
  patient_age INT NOT NULL,
  patient_email VARCHAR(160) NOT NULL,
  patient_phone VARCHAR(10) NOT NULL,
  whatsapp_number VARCHAR(15) NOT NULL,
  visit_type ENUM('New Patient', 'Returning Patient') DEFAULT 'New Patient',
  urgency ENUM('Routine', 'Urgent Pain') DEFAULT 'Routine',
  reminder_opt_in BOOLEAN DEFAULT TRUE,
  doctor_id VARCHAR(40) NOT NULL,
  treatment_id VARCHAR(40) NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  notes VARCHAR(255) DEFAULT '',
  status ENUM('Confirmed', 'Cancelled') DEFAULT 'Confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (treatment_id) REFERENCES treatments(id),
  UNIQUE KEY unique_doctor_slot (doctor_id, appointment_date, time_slot, status)
);

-- 4. Ask a Dentist Q&A Table
CREATE TABLE dental_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_name VARCHAR(120) NOT NULL,
  patient_email VARCHAR(160) NOT NULL,
  topic VARCHAR(80) NOT NULL,
  question TEXT NOT NULL,
  answered_by_doctor_id VARCHAR(40) NULL,
  answer TEXT NULL,
  status ENUM('Answered', 'Pending Review') DEFAULT 'Pending Review',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (answered_by_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);
