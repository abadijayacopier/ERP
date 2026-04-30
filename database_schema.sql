CREATE DATABASE IF NOT EXISTS erp;
USE erp;

-- Table for Daily Shift Reports (DSR)
DROP TABLE IF EXISTS dsr_reports;
CREATE TABLE dsr_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_date DATE NOT NULL,
    shift VARCHAR(50) NOT NULL,
    supervisor_name VARCHAR(100) NOT NULL,
    production_bcm DECIMAL(15, 2) DEFAULT 0,
    weather_condition VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Fleet Monitoring
DROP TABLE IF EXISTS fleet_status;
CREATE TABLE fleet_status (
    unit_id VARCHAR(20) PRIMARY KEY,
    unit_type VARCHAR(50),
    model VARCHAR(50),
    status ENUM('Running', 'Standby', 'Breakdown') DEFAULT 'Standby',
    operator_name VARCHAR(100),
    location VARCHAR(100),
    fuel_level INT,
    next_pm_hours INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users / Personnel Table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'EXECUTIVE', 'MECHANIC', 'TECHNICIAN', 'OPERATOR', 'HSE') DEFAULT 'TECHNICIAN',
    department VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Settings
DROP TABLE IF EXISTS company_settings;
CREATE TABLE company_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(100),
    npwp VARCHAR(50),
    logo_url VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Printers
DROP TABLE IF EXISTS printers;
CREATE TABLE printers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('Dot Matrix', 'Inkjet', 'Thermal') NOT NULL,
    connection_type ENUM('USB', 'Network', 'LPT', 'COM') NOT NULL,
    address VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs
DROP TABLE IF EXISTS activity_logs;
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100),
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Jobs
DROP TABLE IF EXISTS maintenance_jobs;
CREATE TABLE maintenance_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id VARCHAR(50) NOT NULL,
    type ENUM('Preventive', 'Breakdown', 'Repair', 'Overhaul') NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    description TEXT,
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    mechanic_name VARCHAR(100),
    scheduled_date DATE,
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spareparts Inventory
DROP TABLE IF EXISTS spareparts;
CREATE TABLE spareparts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_number VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    unit_of_measure VARCHAR(20) DEFAULT 'pcs',
    price_per_unit DECIMAL(15, 2),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Parts Usage
DROP TABLE IF EXISTS parts_usage;
CREATE TABLE parts_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT,
    part_id INT,
    quantity INT NOT NULL,
    usage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES maintenance_jobs(id),
    FOREIGN KEY (part_id) REFERENCES spareparts(id)
);

-- Inventory Transactions
DROP TABLE IF EXISTS inventory_transactions;
CREATE TABLE inventory_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    item_type ENUM('Sparepart', 'Fuel', 'Explosive', 'Consumable') NOT NULL,
    transaction_type ENUM('In', 'Out', 'Adjustment') NOT NULL,
    quantity DECIMAL(15, 2) NOT NULL,
    reference_id VARCHAR(100),
    user_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- General Inventory
DROP TABLE IF EXISTS general_inventory;
CREATE TABLE general_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    stock_quantity DECIMAL(15, 2) DEFAULT 0,
    unit VARCHAR(20),
    min_stock_level DECIMAL(15, 2),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Invoices
DROP TABLE IF EXISTS invoices;
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    project_name VARCHAR(255),
    issue_date DATE,
    due_date DATE,
    total_amount DECIMAL(20, 2) DEFAULT 0,
    tax_amount DECIMAL(20, 2) DEFAULT 0,
    status ENUM('Draft', 'Pending', 'Sent', 'Paid', 'Overdue', 'Cancelled') DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Items
DROP TABLE IF EXISTS invoice_items;
CREATE TABLE invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT,
    description TEXT,
    quantity DECIMAL(15, 2),
    unit VARCHAR(20),
    unit_price DECIMAL(15, 2),
    total_price DECIMAL(20, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Sample Data for Fleet
INSERT INTO fleet_status (unit_id, unit_type, model, status, operator_name, location, fuel_level, next_pm_hours) VALUES
('EXC-001', 'Excavator', 'CAT 6060', 'Running', 'Budi Santoso', 'Pit A - North', 65, 120),
('DT-205', 'Dump Truck', 'HD785-7', 'Running', 'Ahmad Yani', 'Waste Dump 2', 32, 45),
('DT-208', 'Dump Truck', 'HD785-7', 'Standby', NULL, 'Pit B - South', 90, 12),
('EXC-004', 'Excavator', 'PC2000-8', 'Breakdown', 'Junaidi', 'Pit A - Workshop', 15, 0);

-- Insert some sample logs
INSERT INTO activity_logs (user_name, action, module, details) VALUES
('Site Manager', 'Updated Fuel Stock', 'Logistics', 'Added 5000L to Tank A'),
('Admin South', 'Registered New Unit', 'Fleet', 'Added Excavator EXC-205'),
('Inventory Staff', 'Stock Alert Resolved', 'Inventory', 'Ordered Spareparts for DT-102'),
('System', 'Daily Backup Completed', 'System', 'Automated database synchronization success');

-- Sample Data for Fuel
INSERT INTO general_inventory (item_name, category, stock_quantity, unit, min_stock_level, location) VALUES
('Fuel Tank A (Solar)', 'Fuel', 15000.00, 'L', 5000.00, 'Main Workshop'),
('Fuel Tank B (Solar)', 'Fuel', 8500.00, 'L', 5000.00, 'Pit A North'),
('Fuel Tank C (Dexlite)', 'Fuel', 1200.00, 'L', 1000.00, 'Office Depot');

-- Vendors Table
DROP TABLE IF EXISTS vendors;
CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders Table
DROP TABLE IF EXISTS purchase_orders;
CREATE TABLE purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id INT,
    order_date DATE,
    delivery_date DATE,
    total_amount DECIMAL(20, 2) DEFAULT 0,
    status ENUM('Draft', 'Requested', 'Approved', 'Ordered', 'Received', 'Cancelled') DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Sample Data for Vendors
INSERT INTO vendors (name, category, contact_person, email) VALUES
('United Tractors', 'Heavy Equipment', 'Bpk. Suroso', 'sales@unitedtractors.com'),
('Trakindo Utama', 'Spareparts', 'Ibu Maya', 'maya@trakindo.co.id'),
('Pertamina Patra Niaga', 'Fuel', 'Bpk. Heru', 'heru@pertamina.com');

-- Sample Data for Purchase Orders
INSERT INTO purchase_orders (po_number, vendor_id, order_date, total_amount, status) VALUES
('PO-2026-001', 1, '2026-04-10', 450000000.00, 'Approved'),
('PO-2026-002', 2, '2026-04-15', 12500000.00, 'Ordered'),
('PO-2026-003', 3, '2026-04-20', 85000000.00, 'Draft');

-- Sample Data for Users
INSERT INTO users (username, full_name, role, department) VALUES
('adi_admin', 'Adi Rahman Samari', 'ADMIN', 'MANAGEMENT'),
('budi_ops', 'Budi Santoso', 'EXECUTIVE', 'SITE OPERATIONS'),
('agus_fix', 'Agus Mekanik', 'TECHNICIAN', 'MAINTENANCE'),
('siti_hse', 'Siti Safety', 'HSE', 'SAFETY'),
('indra_ops', 'Indra Operator', 'OPERATOR', 'PRODUCTION');

-- KPI Logs for historical tracking
DROP TABLE IF EXISTS kpi_logs;
CREATE TABLE kpi_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_date DATE NOT NULL,
    unit_id VARCHAR(50),
    pa DECIMAL(5, 2),
    ma DECIMAL(5, 2),
    ua DECIMAL(5, 2),
    working_hours DECIMAL(5, 2),
    standby_hours DECIMAL(5, 2),
    breakdown_hours DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unit Hierarchy for grouping (Point 10)
DROP TABLE IF EXISTS unit_hierarchy;
CREATE TABLE unit_hierarchy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_group VARCHAR(100), -- e.g., "Heavy Equipment", "Support"
    sub_group VARCHAR(100),    -- e.g., "Excavator", "Dump Truck"
    model_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data for Hierarchy
-- Daily HM Logs for precise calculation
DROP TABLE IF EXISTS unit_daily_hm;
CREATE TABLE unit_daily_hm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id VARCHAR(50) NOT NULL,
    log_date DATE NOT NULL,
    hm_start DECIMAL(15, 2),
    hm_end DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data for Fleet (matching image)
INSERT INTO fleet_status (unit_id, unit_type, model, status, next_pm_hours) VALUES
('DT TATA 035', 'Dump Truck', 'TATA 2528', 'Running', 14781),
('DT TATA 064', 'Dump Truck', 'TATA 2528', 'Running', 16316),
('DT TATA 070', 'Dump Truck', 'TATA 2528', 'Running', 13404),
('DT TATA 078', 'Dump Truck', 'TATA 2528', 'Running', 13385),
('DT TATA 085', 'Dump Truck', 'TATA 2528', 'Running', 15612),
('DT TATA 086', 'Dump Truck', 'TATA 2528', 'Running', 15433),
('DT TATA 088', 'Dump Truck', 'TATA 2528', 'Running', 15797),
('DT MERCY 037', 'Dump Truck', 'MERCY AXOR', 'Running', 15945),
('DT MERCY 038', 'Dump Truck', 'MERCY AXOR', 'Running', 19158),
('DT MERCY 039', 'Dump Truck', 'MERCY AXOR', 'Running', 18302);

-- Sample Data for Daily HM (Awal Bulan)
INSERT INTO unit_daily_hm (unit_id, log_date, hm_start, hm_end) VALUES
('DT TATA 035', '2026-04-01', 14778.00, 14781.00),
('DT TATA 064', '2026-04-01', 16204.00, 16316.00),
('DT TATA 070', '2026-04-01', 13239.00, 13404.00),
('DT TATA 078', '2026-04-01', 13225.00, 13385.00),
('DT TATA 085', '2026-04-01', 15461.00, 15612.00),
('DT TATA 086', '2026-04-01', 15411.00, 15433.00),
('DT TATA 088', '2026-04-01', 15743.00, 15797.00),
('DT MERCY 037', '2026-04-01', 15606.00, 15945.00),
('DT MERCY 038', '2026-04-01', 18765.00, 19158.00),
('DT MERCY 039', '2026-04-01', 18054.00, 18302.00);

-- Delay Logs for Summary Table (Wet, Standby, Accident, etc)
DROP TABLE IF EXISTS unit_delay_logs;
CREATE TABLE unit_delay_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id VARCHAR(50) NOT NULL,
    delay_type ENUM('Accident', 'Wet', 'Standby', 'Wait Part', 'Wait Tool', 'Wait Mechanic', 'Other') NOT NULL,
    duration_hours DECIMAL(10, 2) NOT NULL,
    log_date DATE NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add sample delay data
INSERT INTO unit_delay_logs (unit_id, delay_type, duration_hours, log_date) VALUES
('DT TATA 035', 'Wet', 4.5, '2026-04-10'),
('DT TATA 035', 'Standby', 12.0, '2026-04-11'),
('DT MERCY 037', 'Wait Part', 48.0, '2026-04-12'),
('DT MERCY 039', 'Accident', 24.0, '2026-04-15');
