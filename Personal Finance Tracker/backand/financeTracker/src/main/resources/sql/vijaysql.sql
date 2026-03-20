-- Vijay seed script
-- Seeds all related data for an existing user row.
-- Target user id:
-- c33ba49d-9cb7-4885-b41b-813234ffaa9b

BEGIN;

CREATE TEMP TABLE _seed_ctx AS
SELECT 'c33ba49d-9cb7-4885-b41b-813234ffaa9b'::uuid AS user_id;

-- Clear existing seeded data for this user so the script is rerunnable.
DELETE FROM notifications
WHERE user_id = (SELECT user_id FROM _seed_ctx);

DELETE FROM recurring_transactions
WHERE user_id = (SELECT user_id FROM _seed_ctx);

DELETE FROM transactions
WHERE user_id = (SELECT user_id FROM _seed_ctx);

DELETE FROM budgets
WHERE user_id = (SELECT user_id FROM _seed_ctx);

DELETE FROM goals
WHERE user_id = (SELECT user_id FROM _seed_ctx);

DELETE FROM categories
WHERE user_id = (SELECT user_id FROM _seed_ctx);

DELETE FROM accounts
WHERE user_id = (SELECT user_id FROM _seed_ctx);

DELETE FROM user_settings
WHERE user_id = (SELECT user_id FROM _seed_ctx);

-- Settings
INSERT INTO user_settings (id, user_id, settings_json, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000005001',
    (SELECT user_id FROM _seed_ctx),
    '{
      "allowSendEmailNotification": true,
      "allowBudgetThresholdAlert": true,
      "allowBudgetExceededAlert": true,
      "allowGoalNotification": true,
      "allowGoalCompletionBeforeTargetDateNotification": true,
      "allowGoalMissedTargetDateNotification": true,
      "allowMonthlyBudgetReport": true,
      "navbarVerticalEnabled": false
    }',
    NOW(),
    NOW()
);

-- Categories
INSERT INTO categories (id, user_id, name, type, color, icon, is_archived)
VALUES
    ('00000000-0000-0000-0000-000000005010', (SELECT user_id FROM _seed_ctx), 'Salary', 'income', '#1B5E20', 'briefcase', false),
    ('00000000-0000-0000-0000-000000005011', (SELECT user_id FROM _seed_ctx), 'Freelance', 'income', '#2E7D32', 'laptop', false),
    ('00000000-0000-0000-0000-000000005012', (SELECT user_id FROM _seed_ctx), 'Interest', 'income', '#33691E', 'piggy-bank', false),
    ('00000000-0000-0000-0000-000000005013', (SELECT user_id FROM _seed_ctx), 'Groceries', 'expense', '#C62828', 'shopping-basket', false),
    ('00000000-0000-0000-0000-000000005014', (SELECT user_id FROM _seed_ctx), 'Rent', 'expense', '#6A1B9A', 'house', false),
    ('00000000-0000-0000-0000-000000005015', (SELECT user_id FROM _seed_ctx), 'Transport', 'expense', '#1565C0', 'car', false),
    ('00000000-0000-0000-0000-000000005016', (SELECT user_id FROM _seed_ctx), 'Dining Out', 'expense', '#EF6C00', 'utensils', false),
    ('00000000-0000-0000-0000-000000005017', (SELECT user_id FROM _seed_ctx), 'Utilities', 'expense', '#455A64', 'droplets', false),
    ('00000000-0000-0000-0000-000000005018', (SELECT user_id FROM _seed_ctx), 'Entertainment', 'expense', '#AD1457', 'film', false),
    ('00000000-0000-0000-0000-000000005019', (SELECT user_id FROM _seed_ctx), 'Medical', 'expense', '#00838F', 'heart-pulse', false),
    ('00000000-0000-0000-0000-000000005020', (SELECT user_id FROM _seed_ctx), 'Shopping', 'expense', '#5D4037', 'shopping-bag', false),
    ('00000000-0000-0000-0000-000000005021', (SELECT user_id FROM _seed_ctx), 'Travel', 'expense', '#283593', 'plane', false),
    ('00000000-0000-0000-0000-000000005022', (SELECT user_id FROM _seed_ctx), 'Insurance', 'expense', '#3949AB', 'shield-check', false),
    ('00000000-0000-0000-0000-000000005023', (SELECT user_id FROM _seed_ctx), 'Internet', 'expense', '#0277BD', 'wifi', false),
    ('00000000-0000-0000-0000-000000005024', (SELECT user_id FROM _seed_ctx), 'EMI', 'expense', '#4E342E', 'credit-card', false),
    ('00000000-0000-0000-0000-000000005025', (SELECT user_id FROM _seed_ctx), 'Goal Funding', 'expense', '#4E342E', 'piggy-bank', false);

-- Accounts
INSERT INTO accounts (id, user_id, name, type, opening_balance, current_balance, institution_name, is_active, created_at)
VALUES
    ('00000000-0000-0000-0000-000000005030', (SELECT user_id FROM _seed_ctx), 'vijay_hdfc_primary', 'checking', 185000.00, 185000.00, 'HDFC Bank', true, NOW()),
    ('00000000-0000-0000-0000-000000005031', (SELECT user_id FROM _seed_ctx), 'vijay_icici_spend', 'savings', 92000.00, 92000.00, 'ICICI Bank', true, NOW()),
    ('00000000-0000-0000-0000-000000005032', (SELECT user_id FROM _seed_ctx), 'vijay_sbi_reserve', 'savings', 148000.00, 148000.00, 'SBI', true, NOW()),
    ('00000000-0000-0000-0000-000000005033', (SELECT user_id FROM _seed_ctx), 'vijay_cash_wallet', 'cash', 22000.00, 22000.00, 'Cash Wallet', true, NOW());

-- Goals
INSERT INTO goals (id, user_id, name, target_amount, current_amount, target_date, linked_account_id, status)
VALUES
    ('00000000-0000-0000-0000-000000005040', (SELECT user_id FROM _seed_ctx), 'Emergency Fund 2026', 300000.00, 0.00, DATE '2026-09-30', '00000000-0000-0000-0000-000000005032', 'active'),
    ('00000000-0000-0000-0000-000000005041', (SELECT user_id FROM _seed_ctx), 'Japan Vacation', 220000.00, 0.00, DATE '2026-10-15', '00000000-0000-0000-0000-000000005032', 'active'),
    ('00000000-0000-0000-0000-000000005042', (SELECT user_id FROM _seed_ctx), 'MacBook Upgrade', 180000.00, 0.00, DATE '2026-07-20', '00000000-0000-0000-0000-000000005031', 'active'),
    ('00000000-0000-0000-0000-000000005043', (SELECT user_id FROM _seed_ctx), 'Bike Down Payment', 90000.00, 0.00, DATE '2026-06-10', '00000000-0000-0000-0000-000000005031', 'active'),
    ('00000000-0000-0000-0000-000000005044', (SELECT user_id FROM _seed_ctx), 'Family Festival Fund', 70000.00, 0.00, DATE '2026-05-25', '00000000-0000-0000-0000-000000005033', 'active');

-- Budgets for Dec 2025 to Mar 2026
INSERT INTO budgets (id, user_id, category_id, month, year, amount, money_spent, alert_threshold_percent)
VALUES
    ('00000000-0000-0000-0000-000000005100', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005013', 12, 2025, 18000.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000005101', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005014', 12, 2025, 25000.00, 0.00, 90),
    ('00000000-0000-0000-0000-000000005102', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005015', 12, 2025, 6500.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000005103', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005016', 12, 2025, 8500.00, 0.00, 75),
    ('00000000-0000-0000-0000-000000005104', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005017', 12, 2025, 7200.00, 0.00, 85),
    ('00000000-0000-0000-0000-000000005105', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005018', 12, 2025, 7800.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000005106', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005013', 1, 2026, 18500.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000005107', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005014', 1, 2026, 25000.00, 0.00, 90),
    ('00000000-0000-0000-0000-000000005108', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005015', 1, 2026, 6800.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000005109', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005016', 1, 2026, 9000.00, 0.00, 75),
    ('00000000-0000-0000-0000-000000005110', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005017', 1, 2026, 7300.00, 0.00, 85),
    ('00000000-0000-0000-0000-000000005111', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005018', 1, 2026, 8200.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000005112', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005013', 2, 2026, 19000.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000005113', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005014', 2, 2026, 25200.00, 0.00, 90),
    ('00000000-0000-0000-0000-000000005114', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005015', 2, 2026, 6900.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000005115', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005016', 2, 2026, 9400.00, 0.00, 75),
    ('00000000-0000-0000-0000-000000005116', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005017', 2, 2026, 7600.00, 0.00, 85),
    ('00000000-0000-0000-0000-000000005117', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005018', 2, 2026, 8500.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000005118', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005013', 3, 2026, 19500.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000005119', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005014', 3, 2026, 25500.00, 0.00, 90),
    ('00000000-0000-0000-0000-000000005120', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005015', 3, 2026, 7100.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000005121', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005016', 3, 2026, 9800.00, 0.00, 75),
    ('00000000-0000-0000-0000-000000005122', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005017', 3, 2026, 7800.00, 0.00, 85),
    ('00000000-0000-0000-0000-000000005123', (SELECT user_id FROM _seed_ctx), '00000000-0000-0000-0000-000000005018', 3, 2026, 8800.00, 0.00, 80);

-- Recurring items
INSERT INTO recurring_transactions (
    id, user_id, title, type, amount, category_id, account_id,
    frequency, start_date, end_date, next_run_date, auto_create_transaction
)
VALUES
    ('00000000-0000-0000-0000-000000005200', (SELECT user_id FROM _seed_ctx), 'Monthly House Rent', 'expense', 24500.00, '00000000-0000-0000-0000-000000005014', '00000000-0000-0000-0000-000000005030', 'monthly', DATE '2025-12-01', NULL, DATE '2026-04-01', true),
    ('00000000-0000-0000-0000-000000005201', (SELECT user_id FROM _seed_ctx), 'Home Internet', 'expense', 1099.00, '00000000-0000-0000-0000-000000005023', '00000000-0000-0000-0000-000000005031', 'monthly', DATE '2025-12-06', NULL, DATE '2026-04-06', true),
    ('00000000-0000-0000-0000-000000005202', (SELECT user_id FROM _seed_ctx), 'Health Insurance', 'expense', 3200.00, '00000000-0000-0000-0000-000000005022', '00000000-0000-0000-0000-000000005030', 'monthly', DATE '2025-12-09', NULL, DATE '2026-04-09', true),
    ('00000000-0000-0000-0000-000000005203', (SELECT user_id FROM _seed_ctx), 'Freelance Retainer', 'income', 18500.00, '00000000-0000-0000-0000-000000005011', '00000000-0000-0000-0000-000000005031', 'monthly', DATE '2025-12-15', NULL, DATE '2026-04-15', true),
    ('00000000-0000-0000-0000-000000005204', (SELECT user_id FROM _seed_ctx), 'Wallet Top-up', 'transfer', 2500.00, '00000000-0000-0000-0000-000000005015', '00000000-0000-0000-0000-000000005030', 'monthly', DATE '2025-12-12', NULL, DATE '2026-04-12', true);

-- Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
VALUES
    ('00000000-0000-0000-0000-000000005300', (SELECT user_id FROM _seed_ctx), 'Budget alert: Groceries', 'Groceries crossed the configured threshold for January 2026.', 'BUDGET_WARNING', false, NOW() - INTERVAL '18 days'),
    ('00000000-0000-0000-0000-000000005301', (SELECT user_id FROM _seed_ctx), 'Budget alert: Dining Out', 'Dining Out crossed the configured threshold for January 2026.', 'BUDGET_WARNING', true, NOW() - INTERVAL '17 days'),
    ('00000000-0000-0000-0000-000000005302', (SELECT user_id FROM _seed_ctx), 'Budget exceeded: Entertainment', 'Entertainment budget reached more than 100% in February 2026.', 'BUDGET_WARNING', false, NOW() - INTERVAL '15 days'),
    ('00000000-0000-0000-0000-000000005303', (SELECT user_id FROM _seed_ctx), 'Goal progress', 'Emergency Fund 2026 received a strong contribution this month.', 'DAILY_REMINDER', true, NOW() - INTERVAL '14 days'),
    ('00000000-0000-0000-0000-000000005304', (SELECT user_id FROM _seed_ctx), 'Recurring reminder', 'Monthly House Rent is due in the next 3 days.', 'DAILY_REMINDER', false, NOW() - INTERVAL '13 days'),
    ('00000000-0000-0000-0000-000000005305', (SELECT user_id FROM _seed_ctx), 'Recurring payment processed', 'Home Internet recurring payment was added automatically.', 'SYSTEM_UPDATE', true, NOW() - INTERVAL '12 days'),
    ('00000000-0000-0000-0000-000000005306', (SELECT user_id FROM _seed_ctx), 'Budget alert: Transport', 'Transport crossed the configured threshold for February 2026.', 'BUDGET_WARNING', false, NOW() - INTERVAL '11 days'),
    ('00000000-0000-0000-0000-000000005307', (SELECT user_id FROM _seed_ctx), 'Goal progress', 'Japan Vacation is moving steadily toward the target.', 'DAILY_REMINDER', true, NOW() - INTERVAL '10 days'),
    ('00000000-0000-0000-0000-000000005308', (SELECT user_id FROM _seed_ctx), 'Monthly budget report ready', 'Your monthly budget summary for February 2026 is available.', 'SYSTEM_UPDATE', false, NOW() - INTERVAL '8 days'),
    ('00000000-0000-0000-0000-000000005309', (SELECT user_id FROM _seed_ctx), 'Budget exceeded: Utilities', 'Utilities budget crossed 100% in March 2026.', 'BUDGET_WARNING', false, NOW() - INTERVAL '6 days'),
    ('00000000-0000-0000-0000-000000005310', (SELECT user_id FROM _seed_ctx), 'Goal update', 'MacBook Upgrade has received multiple contributions recently.', 'DAILY_REMINDER', true, NOW() - INTERVAL '4 days'),
    ('00000000-0000-0000-0000-000000005311', (SELECT user_id FROM _seed_ctx), 'System note', 'Your finance workspace was refreshed with new seeded data.', 'SYSTEM_UPDATE', false, NOW() - INTERVAL '1 day');

-- 436 daily/base transactions + 12 goal contributions = 448 transactions
WITH date_series AS (
    SELECT gs::date AS tx_date, ROW_NUMBER() OVER (ORDER BY gs) AS seq
    FROM generate_series(DATE '2025-12-01', DATE '2026-03-19', INTERVAL '1 day') AS gs
),
tx_transport AS (
    SELECT
        ('00000000-0000-0000-0000-' || LPAD((5500 + seq)::text, 12, '0'))::uuid AS id,
        (SELECT user_id FROM _seed_ctx) AS user_id,
        CASE WHEN seq % 4 = 0
             THEN '00000000-0000-0000-0000-000000005033'::uuid
             ELSE '00000000-0000-0000-0000-000000005030'::uuid
        END AS account_id,
        NULL::uuid AS to_account_id,
        '00000000-0000-0000-0000-000000005015'::uuid AS category_id,
        NULL::uuid AS goal_id,
        'expense'::varchar(20) AS type,
        (95 + ((seq % 6) * 28))::numeric(12,2) AS amount,
        tx_date AS transaction_date,
        CASE WHEN seq % 3 = 0 THEN 'Metro Recharge' ELSE 'Fuel Stop' END::varchar(200) AS merchant,
        'Local commute and fuel spend'::text AS note,
        CASE WHEN seq % 4 = 0 THEN 'cash' ELSE 'upi' END::varchar(50) AS payment_method
    FROM date_series
),
tx_food AS (
    SELECT
        ('00000000-0000-0000-0000-' || LPAD((6500 + seq)::text, 12, '0'))::uuid AS id,
        (SELECT user_id FROM _seed_ctx) AS user_id,
        CASE WHEN seq % 5 = 0
             THEN '00000000-0000-0000-0000-000000005033'::uuid
             ELSE '00000000-0000-0000-0000-000000005031'::uuid
        END AS account_id,
        NULL::uuid AS to_account_id,
        CASE WHEN seq % 4 = 0
             THEN '00000000-0000-0000-0000-000000005016'::uuid
             ELSE '00000000-0000-0000-0000-000000005013'::uuid
        END AS category_id,
        NULL::uuid AS goal_id,
        'expense'::varchar(20) AS type,
        CASE WHEN seq % 4 = 0
             THEN (320 + ((seq % 5) * 60))::numeric(12,2)
             ELSE (260 + ((seq % 6) * 42))::numeric(12,2)
        END AS amount,
        tx_date AS transaction_date,
        CASE WHEN seq % 4 = 0 THEN 'Dinner Table' ELSE 'Fresh Basket' END::varchar(200) AS merchant,
        CASE WHEN seq % 4 = 0 THEN 'Dining and cafe spend' ELSE 'House groceries' END::text AS note,
        'card'::varchar(50) AS payment_method
    FROM date_series
),
tx_lifestyle AS (
    SELECT
        ('00000000-0000-0000-0000-' || LPAD((7500 + seq)::text, 12, '0'))::uuid AS id,
        (SELECT user_id FROM _seed_ctx) AS user_id,
        CASE WHEN seq % 3 = 0
             THEN '00000000-0000-0000-0000-000000005031'::uuid
             ELSE '00000000-0000-0000-0000-000000005030'::uuid
        END AS account_id,
        NULL::uuid AS to_account_id,
        CASE
            WHEN seq % 6 = 0 THEN '00000000-0000-0000-0000-000000005018'::uuid
            WHEN seq % 6 = 1 THEN '00000000-0000-0000-0000-000000005020'::uuid
            WHEN seq % 6 = 2 THEN '00000000-0000-0000-0000-000000005019'::uuid
            WHEN seq % 6 = 3 THEN '00000000-0000-0000-0000-000000005021'::uuid
            WHEN seq % 6 = 4 THEN '00000000-0000-0000-0000-000000005017'::uuid
            ELSE '00000000-0000-0000-0000-000000005022'::uuid
        END AS category_id,
        NULL::uuid AS goal_id,
        'expense'::varchar(20) AS type,
        CASE
            WHEN seq % 6 = 0 THEN (180 + ((seq % 4) * 85))::numeric(12,2)
            WHEN seq % 6 = 1 THEN (240 + ((seq % 5) * 90))::numeric(12,2)
            WHEN seq % 6 = 2 THEN (150 + ((seq % 3) * 55))::numeric(12,2)
            WHEN seq % 6 = 3 THEN (260 + ((seq % 4) * 150))::numeric(12,2)
            WHEN seq % 6 = 4 THEN (120 + ((seq % 5) * 38))::numeric(12,2)
            ELSE (210 + ((seq % 4) * 120))::numeric(12,2)
        END AS amount,
        tx_date AS transaction_date,
        CASE
            WHEN seq % 6 = 0 THEN 'Weekend Screen'
            WHEN seq % 6 = 1 THEN 'Urban Cart'
            WHEN seq % 6 = 2 THEN 'Wellness Clinic'
            WHEN seq % 6 = 3 THEN 'Trip Saver'
            WHEN seq % 6 = 4 THEN 'Power Grid'
            ELSE 'Life Cover'
        END::varchar(200) AS merchant,
        'Lifestyle and variable monthly spending'::text AS note,
        CASE WHEN seq % 6 IN (0, 1, 3) THEN 'card' ELSE 'upi' END::varchar(50) AS payment_method
    FROM date_series
),
tx_finance AS (
    SELECT
        ('00000000-0000-0000-0000-' || LPAD((8500 + seq)::text, 12, '0'))::uuid AS id,
        (SELECT user_id FROM _seed_ctx) AS user_id,
        CASE
            WHEN EXTRACT(DAY FROM tx_date) IN (10, 20) THEN '00000000-0000-0000-0000-000000005030'::uuid
            WHEN EXTRACT(DAY FROM tx_date) = 25 THEN '00000000-0000-0000-0000-000000005032'::uuid
            ELSE '00000000-0000-0000-0000-000000005030'::uuid
        END AS account_id,
        CASE
            WHEN EXTRACT(DAY FROM tx_date) IN (10, 20) THEN '00000000-0000-0000-0000-000000005032'::uuid
            WHEN EXTRACT(DAY FROM tx_date) = 25 THEN '00000000-0000-0000-0000-000000005033'::uuid
            ELSE NULL::uuid
        END AS to_account_id,
        CASE
            WHEN EXTRACT(DAY FROM tx_date) = 1 THEN '00000000-0000-0000-0000-000000005010'::uuid
            WHEN EXTRACT(DAY FROM tx_date) = 15 THEN '00000000-0000-0000-0000-000000005011'::uuid
            WHEN EXTRACT(DAY FROM tx_date) = 27 THEN '00000000-0000-0000-0000-000000005012'::uuid
            WHEN EXTRACT(DAY FROM tx_date) = 6 THEN '00000000-0000-0000-0000-000000005023'::uuid
            WHEN EXTRACT(DAY FROM tx_date) = 9 THEN '00000000-0000-0000-0000-000000005022'::uuid
            WHEN EXTRACT(DAY FROM tx_date) = 12 THEN '00000000-0000-0000-0000-000000005024'::uuid
            WHEN EXTRACT(DAY FROM tx_date) IN (10, 20, 25) THEN '00000000-0000-0000-0000-000000005015'::uuid
            ELSE '00000000-0000-0000-0000-000000005017'::uuid
        END AS category_id,
        NULL::uuid AS goal_id,
        CASE
            WHEN EXTRACT(DAY FROM tx_date) = 1 THEN 'income'
            WHEN EXTRACT(DAY FROM tx_date) = 15 THEN 'income'
            WHEN EXTRACT(DAY FROM tx_date) = 27 THEN 'income'
            WHEN EXTRACT(DAY FROM tx_date) IN (10, 20, 25) THEN 'transfer'
            ELSE 'expense'
        END::varchar(20) AS type,
        CASE
            WHEN EXTRACT(DAY FROM tx_date) = 1 THEN 76000.00::numeric(12,2)
            WHEN EXTRACT(DAY FROM tx_date) = 15 THEN 21500.00::numeric(12,2)
            WHEN EXTRACT(DAY FROM tx_date) = 27 THEN 1800.00::numeric(12,2)
            WHEN EXTRACT(DAY FROM tx_date) IN (10, 20) THEN 5000.00::numeric(12,2)
            WHEN EXTRACT(DAY FROM tx_date) = 25 THEN 2200.00::numeric(12,2)
            WHEN EXTRACT(DAY FROM tx_date) = 6 THEN 1099.00::numeric(12,2)
            WHEN EXTRACT(DAY FROM tx_date) = 9 THEN 3200.00::numeric(12,2)
            WHEN EXTRACT(DAY FROM tx_date) = 12 THEN 6400.00::numeric(12,2)
            ELSE (110 + ((seq % 5) * 36))::numeric(12,2)
        END AS amount,
        tx_date AS transaction_date,
        CASE
            WHEN EXTRACT(DAY FROM tx_date) = 1 THEN 'Amiti Systems'
            WHEN EXTRACT(DAY FROM tx_date) = 15 THEN 'Freelance Client'
            WHEN EXTRACT(DAY FROM tx_date) = 27 THEN 'Savings Interest'
            WHEN EXTRACT(DAY FROM tx_date) IN (10, 20) THEN 'Reserve Transfer'
            WHEN EXTRACT(DAY FROM tx_date) = 25 THEN 'Wallet Top-up'
            WHEN EXTRACT(DAY FROM tx_date) = 6 THEN 'FiberNet'
            WHEN EXTRACT(DAY FROM tx_date) = 9 THEN 'Secure Health'
            WHEN EXTRACT(DAY FROM tx_date) = 12 THEN 'Credit Card EMI'
            ELSE 'Small Utility Payment'
        END::varchar(200) AS merchant,
        CASE
            WHEN EXTRACT(DAY FROM tx_date) = 1 THEN 'Monthly salary credit'
            WHEN EXTRACT(DAY FROM tx_date) = 15 THEN 'Recurring freelance income'
            WHEN EXTRACT(DAY FROM tx_date) = 27 THEN 'Savings interest'
            WHEN EXTRACT(DAY FROM tx_date) IN (10, 20) THEN 'Move money into reserve account'
            WHEN EXTRACT(DAY FROM tx_date) = 25 THEN 'Move cash to wallet account'
            WHEN EXTRACT(DAY FROM tx_date) = 6 THEN 'Monthly internet bill'
            WHEN EXTRACT(DAY FROM tx_date) = 9 THEN 'Insurance debit'
            WHEN EXTRACT(DAY FROM tx_date) = 12 THEN 'Credit card EMI'
            ELSE 'Routine small utility expense'
        END::text AS note,
        CASE
            WHEN EXTRACT(DAY FROM tx_date) IN (1, 10, 15, 20, 25, 27) THEN 'bank_transfer'
            ELSE 'upi'
        END::varchar(50) AS payment_method
    FROM date_series
),
goal_contributions AS (
    SELECT *
    FROM (
        VALUES
            ('00000000-0000-0000-0000-000000005040'::uuid, '00000000-0000-0000-0000-000000005030'::uuid, '00000000-0000-0000-0000-000000005032'::uuid, DATE '2025-12-08', 6000.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000005041'::uuid, '00000000-0000-0000-0000-000000005031'::uuid, '00000000-0000-0000-0000-000000005032'::uuid, DATE '2025-12-18', 4200.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000005042'::uuid, '00000000-0000-0000-0000-000000005030'::uuid, '00000000-0000-0000-0000-000000005031'::uuid, DATE '2026-01-07', 8500.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000005043'::uuid, '00000000-0000-0000-0000-000000005031'::uuid, '00000000-0000-0000-0000-000000005031'::uuid, DATE '2026-01-19', 3200.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000005044'::uuid, '00000000-0000-0000-0000-000000005033'::uuid, '00000000-0000-0000-0000-000000005033'::uuid, DATE '2026-01-29', 2100.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000005040'::uuid, '00000000-0000-0000-0000-000000005030'::uuid, '00000000-0000-0000-0000-000000005032'::uuid, DATE '2026-02-10', 7200.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000005041'::uuid, '00000000-0000-0000-0000-000000005032'::uuid, '00000000-0000-0000-0000-000000005032'::uuid, DATE '2026-02-16', 4800.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000005042'::uuid, '00000000-0000-0000-0000-000000005030'::uuid, '00000000-0000-0000-0000-000000005031'::uuid, DATE '2026-02-23', 9300.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000005043'::uuid, '00000000-0000-0000-0000-000000005031'::uuid, '00000000-0000-0000-0000-000000005031'::uuid, DATE '2026-03-02', 4100.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000005044'::uuid, '00000000-0000-0000-0000-000000005033'::uuid, '00000000-0000-0000-0000-000000005033'::uuid, DATE '2026-03-05', 2600.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000005040'::uuid, '00000000-0000-0000-0000-000000005032'::uuid, '00000000-0000-0000-0000-000000005032'::uuid, DATE '2026-03-12', 6800.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000005041'::uuid, '00000000-0000-0000-0000-000000005030'::uuid, '00000000-0000-0000-0000-000000005032'::uuid, DATE '2026-03-18', 5100.00::numeric(12,2))
    ) AS gc(goal_id, account_id, to_account_id, transaction_date, amount)
),
goal_contribution_transactions AS (
    SELECT
        ('00000000-0000-0000-0000-' || LPAD((9900 + ROW_NUMBER() OVER (ORDER BY transaction_date))::text, 12, '0'))::uuid AS id,
        (SELECT user_id FROM _seed_ctx) AS user_id,
        gc.account_id,
        gc.to_account_id,
        '00000000-0000-0000-0000-000000005025'::uuid AS category_id,
        gc.goal_id,
        'goal_contribution'::varchar(20) AS type,
        gc.amount,
        gc.transaction_date,
        g.name::varchar(200) AS merchant,
        ('Contribution to ' || g.name)::text AS note,
        'goal_contribution'::varchar(50) AS payment_method
    FROM goal_contributions gc
    JOIN goals g ON g.id = gc.goal_id
)
INSERT INTO transactions (
    id, user_id, account_id, to_account_id, category_id, goal_id, type, amount,
    transaction_date, merchant, note, payment_method, created_at, updated_at
)
SELECT
    id, user_id, account_id, to_account_id, category_id, goal_id, type, amount,
    transaction_date, merchant, note, payment_method, NOW(), NOW()
FROM (
    SELECT * FROM tx_transport
    UNION ALL
    SELECT * FROM tx_food
    UNION ALL
    SELECT * FROM tx_lifestyle
    UNION ALL
    SELECT * FROM tx_finance
    UNION ALL
    SELECT * FROM goal_contribution_transactions
) AS seeded_transactions;

-- Recalculate budgets from monthly expense transactions.
UPDATE budgets b
SET money_spent = COALESCE((
    SELECT SUM(t.amount)
    FROM transactions t
    WHERE t.user_id = b.user_id
      AND t.category_id = b.category_id
      AND t.type = 'expense'
      AND EXTRACT(MONTH FROM t.transaction_date) = b.month
      AND EXTRACT(YEAR FROM t.transaction_date) = b.year
), 0)
WHERE b.user_id = (SELECT user_id FROM _seed_ctx);

-- Recalculate account balances.
UPDATE accounts a
SET current_balance =
    a.opening_balance
    + COALESCE((
        SELECT SUM(t.amount) FROM transactions t
        WHERE t.user_id = a.user_id
          AND t.account_id = a.id
          AND t.type = 'income'
    ), 0)
    - COALESCE((
        SELECT SUM(t.amount) FROM transactions t
        WHERE t.user_id = a.user_id
          AND t.account_id = a.id
          AND t.type IN ('expense', 'transfer')
    ), 0)
    - COALESCE((
        SELECT SUM(t.amount) FROM transactions t
        WHERE t.user_id = a.user_id
          AND t.account_id = a.id
          AND t.type = 'goal_contribution'
          AND t.to_account_id IS NOT NULL
          AND t.to_account_id <> t.account_id
    ), 0)
    + COALESCE((
        SELECT SUM(t.amount) FROM transactions t
        WHERE t.user_id = a.user_id
          AND t.to_account_id = a.id
          AND t.type = 'transfer'
    ), 0)
    + COALESCE((
        SELECT SUM(t.amount) FROM transactions t
        WHERE t.user_id = a.user_id
          AND t.to_account_id = a.id
          AND t.type = 'goal_contribution'
          AND t.to_account_id <> t.account_id
    ), 0)
WHERE a.user_id = (SELECT user_id FROM _seed_ctx);

-- Recalculate goal amounts and status.
UPDATE goals g
SET current_amount = COALESCE((
    SELECT SUM(t.amount)
    FROM transactions t
    WHERE t.goal_id = g.id
      AND t.type = 'goal_contribution'
), 0),
status = CASE
    WHEN COALESCE((
        SELECT SUM(t.amount)
        FROM transactions t
        WHERE t.goal_id = g.id
          AND t.type = 'goal_contribution'
    ), 0) >= g.target_amount THEN 'completed'
    ELSE 'active'
END
WHERE g.user_id = (SELECT user_id FROM _seed_ctx);

DROP TABLE _seed_ctx;

COMMIT;
