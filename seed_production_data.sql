-- SEED DATA PREMIUM UNTUK ERP MINING PRO MAX
USE erp;

-- 1. Bersihkan Data Lama (Optional - Hati-hati!)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE fleet_status;
TRUNCATE TABLE maintenance_jobs;
TRUNCATE TABLE general_inventory;
TRUNCATE TABLE spareparts;
TRUNCATE TABLE dsr_reports;
TRUNCATE TABLE activity_logs;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Data Armada (Fleet) - Alat Berat Realistis
INSERT INTO fleet_status (unit_id, unit_type, model, status, operator_name, location, fuel_level, next_pm_hours) VALUES
('EXC-001', 'Excavator', 'CAT 6060', 'Running', 'Budi Santoso', 'Pit A - South Wall', 65, 120),
('EXC-002', 'Excavator', 'Komatsu PC2000-8', 'Running', 'Dedi Kurniawan', 'Pit B - North', 45, 85),
('EXC-003', 'Excavator', 'Hitachi EX2600', 'Standby', NULL, 'Pit A - East Wall', 90, 10),
('EXC-004', 'Excavator', 'PC2000-8', 'Breakdown', 'Andi Wijaya', 'Main Workshop', 15, 0),
('DT-101', 'Dump Truck', 'Komatsu HD785-7', 'Running', 'Ahmad Yani', 'Pit A to ROM', 32, 45),
('DT-102', 'Dump Truck', 'Komatsu HD785-7', 'Running', 'Sutrisno', 'Pit A to Disposal', 28, 50),
('DT-103', 'Dump Truck', 'CAT 777E', 'Running', 'Iwan Fals', 'Pit B to ROM', 55, 150),
('DT-104', 'Dump Truck', 'CAT 777E', 'Standby', NULL, 'Parking Area B', 85, 200),
('DZ-001', 'Dozer', 'CAT D10T', 'Running', 'Rahmat Hidayat', 'Pit A Disposal', 40, 35),
('DZ-002', 'Dozer', 'Komatsu D375A', 'Running', 'Zulkifli', 'Road Maintenance', 60, 110),
('GR-001', 'Grader', 'CAT 16M', 'Running', 'Ujang', 'Hauling Road KM 12', 45, 90),
('WT-001', 'Water Truck', 'Scania P360', 'Running', 'Soleh', 'Hauling Road KM 5', 25, 30);

-- 3. Data Inventaris Umum (Bulk Resources)
INSERT INTO general_inventory (item_name, category, stock_quantity, unit, min_stock_level, location) VALUES
('Solar B35 (High Speed Diesel)', 'Fuel', 45000.00, 'L', 15000.00, 'Main Tank Farm'),
('Lubricant Shell Tellus S2 V46', 'Oil', 1250.00, 'L', 500.00, 'Lube Store'),
('Lubricant Rimula R4 X 15W-40', 'Oil', 2100.00, 'L', 1000.00, 'Lube Store'),
('Coolant Pre-Mix 50/50', 'Chemical', 850.00, 'L', 200.00, 'Lube Store'),
('Grease EP2 Multi-Purpose', 'Grease', 150.00, 'Kg', 50.00, 'Warehouse A');

-- 4. Data Spareparts (Mechanical Parts)
INSERT INTO spareparts (part_number, name, category, stock_quantity, min_stock_level, unit_of_measure, price_per_unit, location) VALUES
('1R-0749', 'Fuel Filter Secondary CAT', 'Filters', 45, 20, 'pcs', 450000.00, 'WH-01 B4'),
('1R-1808', 'Oil Filter CAT', 'Filters', 32, 15, 'pcs', 550000.00, 'WH-01 B4'),
('600-319-3550', 'Fuel Filter Komatsu', 'Filters', 28, 10, 'pcs', 380000.00, 'WH-02 A1'),
('MIC-2700R49', 'Tire Michelin 27.00R49', 'Tires', 8, 4, 'Units', 450000000.00, 'Tire Bay'),
('HD-HOSE-12', 'Hydraulic Hose 1/2" R2AT', 'Hoses', 150, 50, 'Meters', 125000.00, 'Hose Room');

-- 5. Data Pemeliharaan (Maintenance Jobs)
INSERT INTO maintenance_jobs (unit_id, type, priority, description, status, mechanic_name, scheduled_date) VALUES
('EXC-004', 'Breakdown', 'Critical', 'Engine Low Power & Excessive Smoke', 'In Progress', 'Agus Mekanik', CURDATE()),
('DT-101', 'Preventive', 'Medium', 'Scheduled PM 250 Hours', 'Scheduled', 'Bambang Repair', DATE_ADD(CURDATE(), INTERVAL 2 DAY)),
('DZ-002', 'Repair', 'High', 'Track Link Loose Adjustment', 'Completed', 'Agus Mekanik', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('GR-001', 'Preventive', 'Low', 'Greasing & Visual Inspection', 'Completed', 'Slamet', DATE_SUB(CURDATE(), INTERVAL 3 DAY));

-- 6. Laporan Harian (DSR)
INSERT INTO dsr_reports (report_date, shift, supervisor_name, production_bcm, weather_condition, notes) VALUES
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Day Shift', 'Budi Santoso', 12500.50, 'Sunny', 'All units optimal. Pit A activity high.'),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Night Shift', 'Adi Rahman', 9800.25, 'Cloudy', 'Minor delay at ROM due to queue.'),
(CURDATE(), 'Day Shift', 'Budi Santoso', 11200.00, 'Rain', 'Stopped operation for 2 hours due to slippery road.');

-- 7. Log Aktivitas (Activity Logs)
INSERT INTO activity_logs (user_name, action, module, details) VALUES
('Admin South', 'Import Bulk Data', 'System', 'Injected production seed data to MySQL'),
('Site Manager', 'Approve DSR', 'DSR', 'Approved report for 2026-04-29'),
('Agus Mekanik', 'Start Repair', 'Maintenance', 'Started troubleshooting EXC-004'),
('System', 'Inventory Alert', 'Inventory', 'Tire stock reached minimum threshold');

-- 8. Company Settings (Sesuai Dashboard Pro Max)
UPDATE company_settings SET 
    company_name = 'PT. ABADIJAYA MINING CONTRACTOR', 
    address = 'Jl. Tambang Emas No. 88, Samarinda, Kalimantan Timur',
    wa_api_key = 'wa_pro_max_998877',
    email = 'info@abadijaya-mining.com'
WHERE id = 1;

-- If no row exists, insert one
INSERT INTO company_settings (id, company_name, address, wa_api_key, email)
SELECT 1, 'PT. ABADIJAYA MINING CONTRACTOR', 'Jl. Tambang Emas No. 88, Samarinda, Kalimantan Timur', 'wa_pro_max_998877', 'info@abadijaya-mining.com'
WHERE NOT EXISTS (SELECT 1 FROM company_settings WHERE id = 1);
