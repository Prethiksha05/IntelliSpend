-- =====================================================================
-- IntelliSpend Initial Seed Data
-- =====================================================================

USE intellispend_db;

-- 1. Insert Demo Users (Passwords are BCrypt hashes of 'Password123!')
-- BCrypt $2a$10$wE0v1K...
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, currency, monthly_budget_limit)
VALUES 
(1, 'alex_morgan', 'alex@intellispend.io', '$2a$10$e8wIiqo4z8lGqP5Qv3X9euK5zVzS3rI1P6R6m6p5Wn6yT0A3uV5V2', 'Alex', 'Morgan', 'ROLE_USER', 'USD', 4500.00),
(2, 'admin_sarah', 'admin@intellispend.io', '$2a$10$e8wIiqo4z8lGqP5Qv3X9euK5zVzS3rI1P6R6m6p5Wn6yT0A3uV5V2', 'Sarah', 'Chen', 'ROLE_ADMIN', 'USD', 10000.00)
ON DUPLICATE KEY UPDATE username=username;

-- 2. System Default Categories
INSERT INTO categories (id, name, description, color_code, icon, is_system_default, user_id)
VALUES
(1, 'Food & Dining', 'Restaurants, cafes, groceries, and takeout', '#10B981', 'utensils', TRUE, NULL),
(2, 'Transportation', 'Fuel, public transit, rideshares, flight tickets', '#3B82F6', 'car', TRUE, NULL),
(3, 'Housing & Utilities', 'Rent, mortgage, electricity, water, internet', '#8B5CF6', 'home', TRUE, NULL),
(4, 'Entertainment', 'Streaming, movies, concerts, games', '#EC4899', 'film', TRUE, NULL),
(5, 'Shopping & Electronics', 'Apparel, gadgets, luxury items, gear', '#F59E0B', 'shopping-bag', TRUE, NULL),
(6, 'Health & Wellness', 'Gym, doctors, pharmacy, sports', '#06B6D4', 'heart-pulse', TRUE, NULL),
(7, 'Education & Work', 'Courses, books, software subscriptions, office supplies', '#6366F1', 'book-open', TRUE, NULL),
(8, 'Travel & Vacations', 'Hotels, flights, car rentals, tourism', '#14B8A6', 'plane', TRUE, NULL)
ON DUPLICATE KEY UPDATE name=name;

-- 3. Realistic Expenses with Anomalies for User 1 (Alex Morgan)
INSERT INTO expenses (id, user_id, category_id, amount, expense_date, expense_time, title, description, payment_method, merchant, is_anomaly, anomaly_score, anomaly_reason, anomaly_severity, status)
VALUES
(1, 1, 1, 45.50, '2026-09-01', '12:30:00', 'Trader Joes Groceries', 'Weekly groceries', 'DEBIT_CARD', 'Trader Joes', FALSE, 0.05, 'Normal routine purchase', 'NORMAL', 'COMPLETED'),
(2, 1, 2, 60.00, '2026-09-02', '08:15:00', 'Gasoline refill', 'Shell Station Chevron', 'CREDIT_CARD', 'Shell', FALSE, 0.08, 'Normal fuel expenditure', 'NORMAL', 'COMPLETED'),
(3, 1, 3, 1600.00, '2026-09-03', '09:00:00', 'Monthly Apartment Rent', 'Monthly lease payment', 'BANK_TRANSFER', 'Skyline Properties', FALSE, 0.12, 'Recurring predictable housing cost', 'NORMAL', 'COMPLETED'),
(4, 1, 1, 88.20, '2026-09-05', '19:45:00', 'Italian Bistro Dinner', 'Dinner with teammates', 'CREDIT_CARD', 'Trattoria Roma', FALSE, 0.15, 'Standard weekend dining', 'NORMAL', 'COMPLETED'),
(5, 1, 4, 19.99, '2026-09-07', '00:05:00', 'Netflix 4K Ultra Plan', 'Subscription', 'CREDIT_CARD', 'Netflix', FALSE, 0.02, 'Standard digital subscription', 'NORMAL', 'COMPLETED'),
(6, 1, 5, 149.99, '2026-09-10', '14:20:00', 'Nike Running Shoes', 'Sports sneakers', 'CREDIT_CARD', 'Nike Store', FALSE, 0.22, 'Occasional apparel purchase', 'NORMAL', 'COMPLETED'),
(7, 1, 6, 75.00, '2026-09-12', '10:00:00', 'Dental Routine Checkup', 'Annual cleaning and x-rays', 'DEBIT_CARD', 'Dental Care Center', FALSE, 0.18, 'Routine medical', 'NORMAL', 'COMPLETED'),

-- Anomaly 1: Sudden Huge Outlier ($4,250 Luxury Watch at 3:15 AM)
(8, 1, 5, 4250.00, '2026-09-15', '03:15:22', 'Rolex Boutique Luxury Purchase', 'Sudden midnight high-value jewelry transaction', 'CREDIT_CARD', 'Rolex Authorized Jewelers', TRUE, 0.9650, 'Extreme price deviation (>8.5x mean) & abnormal transaction hour (03:15 AM)', 'CRITICAL', 'COMPLETED'),

(9, 1, 1, 32.50, '2026-09-18', '13:10:00', 'Chipotle Burrito Bowl', 'Lunch with friend', 'CREDIT_CARD', 'Chipotle', FALSE, 0.06, 'Routine food expense', 'NORMAL', 'COMPLETED'),
(10, 1, 2, 28.40, '2026-09-20', '21:30:00', 'Uber Ride Downtown', 'Late night commute back home', 'CREDIT_CARD', 'Uber', FALSE, 0.14, 'Standard ride-share', 'NORMAL', 'COMPLETED'),

-- Anomaly 2: Rapid Velocity Spike / Large Tech Haul
(11, 1, 5, 2899.00, '2026-09-24', '16:45:00', 'Apple Studio Display + Pro Max', 'Major hardware electronics transaction', 'CREDIT_CARD', 'Apple Store Fifth Ave', TRUE, 0.8840, 'Amount 5.4x above category standard deviation', 'HIGH', 'COMPLETED'),

(12, 1, 7, 120.00, '2026-09-28', '11:00:00', 'Cloud Architecture Certification', 'AWS exam voucher', 'CREDIT_CARD', 'Pearson VUE', FALSE, 0.11, 'Professional development', 'NORMAL', 'COMPLETED'),
(13, 1, 1, 55.40, '2026-10-01', '18:30:00', 'Whole Foods Market', 'Produce and organic dairy', 'DEBIT_CARD', 'Whole Foods', FALSE, 0.07, 'Standard grocery run', 'NORMAL', 'COMPLETED'),
(14, 1, 8, 480.00, '2026-10-03', '15:10:00', 'Roundtrip Flight to Seattle', 'Weekend conference tickets', 'CREDIT_CARD', 'Delta Air Lines', FALSE, 0.35, 'Seasonal flight booking', 'MEDIUM', 'COMPLETED')
ON DUPLICATE KEY UPDATE title=title;

-- 4. Anomaly Logs Table
INSERT INTO anomaly_logs (id, expense_id, user_id, anomaly_type, score, severity, explanation, user_feedback)
VALUES
(1, 8, 1, 'AMOUNT_OUTLIER_AND_TIME', 0.9650, 'CRITICAL', 'Transaction amount $4,250.00 is 12.3x higher than user historical Shopping median ($85.00), executed during low-activity window (03:15 AM).', 'PENDING'),
(2, 11, 1, 'CATEGORY_VOLUME_SPIKE', 0.8840, 'HIGH', 'Shopping spend exceeded monthly allocated limit in a single swipe ($2,899.00 vs $600.00 budget).', 'CONFIRMED')
ON DUPLICATE KEY UPDATE explanation=explanation;

-- 5. Budgets for Current Period
INSERT INTO budgets (id, user_id, category_id, monthly_limit, month, year, alert_threshold_percentage)
VALUES
(1, 1, NULL, 4500.00, 10, 2026, 80),
(2, 1, 1, 600.00, 10, 2026, 85),
(3, 1, 2, 300.00, 10, 2026, 75),
(4, 1, 3, 1700.00, 10, 2026, 95),
(5, 1, 4, 250.00, 10, 2026, 80),
(6, 1, 5, 600.00, 10, 2026, 80)
ON DUPLICATE KEY UPDATE monthly_limit=monthly_limit;
