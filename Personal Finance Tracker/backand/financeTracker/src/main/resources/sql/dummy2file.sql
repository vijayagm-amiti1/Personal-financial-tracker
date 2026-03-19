-- Dummy seed v2 for Personal Finance Tracker
-- One user, 3 accounts, categories, budgets, goals, recurring transactions,
-- notifications, and 260 transactions from 2026-01-15 to 2026-03-18.

-- Drop only this seeded user's data so the script is rerunnable.
DELETE FROM notifications
WHERE user_id = '00000000-0000-0000-0000-000000004001';

DELETE FROM recurring_transactions
WHERE user_id = '00000000-0000-0000-0000-000000004001';

DELETE FROM transactions
WHERE user_id = '00000000-0000-0000-0000-000000004001';

DELETE FROM budgets
WHERE user_id = '00000000-0000-0000-0000-000000004001';

DELETE FROM goals
WHERE user_id = '00000000-0000-0000-0000-000000004001';

DELETE FROM categories
WHERE user_id = '00000000-0000-0000-0000-000000004001';

DELETE FROM accounts
WHERE user_id = '00000000-0000-0000-0000-000000004001';

DELETE FROM users
WHERE id = '00000000-0000-0000-0000-000000004001';

-- User
INSERT INTO users (id, email, password_hash, display_name, created_at)
VALUES (
    '00000000-0000-0000-0000-000000004001',
    'demo2@financetracker.local',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M8rXH1Y8gJ5x1n3lN0K6rOeW4v4K',
    'demo2',
    NOW()
);

-- Categories
INSERT INTO categories (id, user_id, name, type, color, icon, is_archived)
VALUES
    ('00000000-0000-0000-0000-000000004010', '00000000-0000-0000-0000-000000004001', 'Salary', 'income', '#1B5E20', 'briefcase', false),
    ('00000000-0000-0000-0000-000000004011', '00000000-0000-0000-0000-000000004001', 'Freelance', 'income', '#2E7D32', 'laptop', false),
    ('00000000-0000-0000-0000-000000004012', '00000000-0000-0000-0000-000000004001', 'Groceries', 'expense', '#C62828', 'shopping-basket', false),
    ('00000000-0000-0000-0000-000000004013', '00000000-0000-0000-0000-000000004001', 'Rent', 'expense', '#6A1B9A', 'home', false),
    ('00000000-0000-0000-0000-000000004014', '00000000-0000-0000-0000-000000004001', 'Transport', 'expense', '#1565C0', 'directions-car', false),
    ('00000000-0000-0000-0000-000000004015', '00000000-0000-0000-0000-000000004001', 'Dining Out', 'expense', '#EF6C00', 'restaurant', false),
    ('00000000-0000-0000-0000-000000004016', '00000000-0000-0000-0000-000000004001', 'Utilities', 'expense', '#455A64', 'bolt', false),
    ('00000000-0000-0000-0000-000000004017', '00000000-0000-0000-0000-000000004001', 'Entertainment', 'expense', '#AD1457', 'movie', false),
    ('00000000-0000-0000-0000-000000004018', '00000000-0000-0000-0000-000000004001', 'Medical', 'expense', '#00838F', 'favorite', false),
    ('00000000-0000-0000-0000-000000004019', '00000000-0000-0000-0000-000000004001', 'Shopping', 'expense', '#5D4037', 'shopping-bag', false),
    ('00000000-0000-0000-0000-000000004020', '00000000-0000-0000-0000-000000004001', 'Travel', 'expense', '#283593', 'flight', false),
    ('00000000-0000-0000-0000-000000004021', '00000000-0000-0000-0000-000000004001', 'Goal Funding', 'expense', '#4E342E', 'savings', false);

-- Accounts
INSERT INTO accounts (id, user_id, name, type, opening_balance, current_balance, institution_name, created_at)
VALUES
    ('00000000-0000-0000-0000-000000004030', '00000000-0000-0000-0000-000000004001', 'demo2_hdfc_primary', 'checking', 240000.00, 240000.00, 'HDFC Bank', NOW()),
    ('00000000-0000-0000-0000-000000004031', '00000000-0000-0000-0000-000000004001', 'demo2_sbi_reserve', 'savings', 125000.00, 125000.00, 'SBI', NOW()),
    ('00000000-0000-0000-0000-000000004032', '00000000-0000-0000-0000-000000004001', 'demo2_wallet_cash', 'cash', 18000.00, 18000.00, 'Cash Wallet', NOW());

-- Goals
INSERT INTO goals (id, user_id, name, target_amount, current_amount, target_date, linked_account_id, status)
VALUES
    ('00000000-0000-0000-0000-000000004040', '00000000-0000-0000-0000-000000004001', 'Emergency Reserve', 250000.00, 0.00, DATE '2026-12-31', '00000000-0000-0000-0000-000000004031', 'active'),
    ('00000000-0000-0000-0000-000000004041', '00000000-0000-0000-0000-000000004001', 'Europe Vacation', 180000.00, 0.00, DATE '2026-11-20', '00000000-0000-0000-0000-000000004031', 'active'),
    ('00000000-0000-0000-0000-000000004042', '00000000-0000-0000-0000-000000004001', 'Workstation Upgrade', 150000.00, 0.00, DATE '2026-10-15', '00000000-0000-0000-0000-000000004030', 'active');

-- Budgets for February and March 2026
INSERT INTO budgets (id, user_id, category_id, month, year, amount, money_spent, alert_threshold_percent)
VALUES
    ('00000000-0000-0000-0000-000000004050', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000004012', 2, 2026, 18000.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000004051', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000004013', 2, 2026, 26000.00, 0.00, 90),
    ('00000000-0000-0000-0000-000000004052', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000004014', 2, 2026, 5500.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000004053', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000004015', 2, 2026, 8500.00, 0.00, 75),
    ('00000000-0000-0000-0000-000000004054', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000004016', 2, 2026, 7000.00, 0.00, 85),
    ('00000000-0000-0000-0000-000000004055', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000004017', 2, 2026, 9000.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000004056', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000004012', 3, 2026, 19000.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000004057', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000004013', 3, 2026, 26000.00, 0.00, 90),
    ('00000000-0000-0000-0000-000000004058', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000004014', 3, 2026, 6000.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000004059', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000004015', 3, 2026, 9000.00, 0.00, 75),
    ('00000000-0000-0000-0000-000000004060', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000004016', 3, 2026, 7200.00, 0.00, 85),
    ('00000000-0000-0000-0000-000000004061', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000004017', 3, 2026, 9500.00, 0.00, 80);

-- Recurring transactions
INSERT INTO recurring_transactions (
    id, user_id, title, type, amount, category_id, account_id,
    frequency, start_date, end_date, next_run_date, auto_create_transaction
)
VALUES
    (
        '00000000-0000-0000-0000-000000004070',
        '00000000-0000-0000-0000-000000004001',
        'House Rent',
        'expense',
        24500.00,
        '00000000-0000-0000-0000-000000004013',
        '00000000-0000-0000-0000-000000004030',
        'monthly',
        DATE '2026-01-01',
        NULL,
        DATE '2026-04-01',
        true
    ),
    (
        '00000000-0000-0000-0000-000000004071',
        '00000000-0000-0000-0000-000000004001',
        'Streaming Bundle',
        'expense',
        799.00,
        '00000000-0000-0000-0000-000000004017',
        '00000000-0000-0000-0000-000000004030',
        'monthly',
        DATE '2026-01-05',
        NULL,
        DATE '2026-04-05',
        true
    ),
    (
        '00000000-0000-0000-0000-000000004072',
        '00000000-0000-0000-0000-000000004001',
        'Freelance Retainer',
        'income',
        18000.00,
        '00000000-0000-0000-0000-000000004011',
        '00000000-0000-0000-0000-000000004031',
        'monthly',
        DATE '2026-01-10',
        NULL,
        DATE '2026-04-10',
        true
    );

-- Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
VALUES
    (
        '00000000-0000-0000-0000-000000004080',
        '00000000-0000-0000-0000-000000004001',
        'Budget check',
        'Dining Out is close to the monthly limit.',
        'BUDGET_WARNING',
        false,
        NOW() - INTERVAL '2 days'
    ),
    (
        '00000000-0000-0000-0000-000000004081',
        '00000000-0000-0000-0000-000000004001',
        'Goal update',
        'Emergency Reserve received new contributions this month.',
        'DAILY_REMINDER',
        false,
        NOW() - INTERVAL '1 day'
    );

-- 252 daily transactions + 8 goal contributions = 260 transactions.
WITH date_series AS (
    SELECT gs::date AS tx_date, ROW_NUMBER() OVER (ORDER BY gs) AS seq
    FROM generate_series(DATE '2026-01-15', DATE '2026-03-18', INTERVAL '1 day') AS gs
),
tx_transport AS (
    SELECT
        ('00000000-0000-0000-0000-' || LPAD((5000 + seq)::text, 12, '0'))::uuid AS id,
        '00000000-0000-0000-0000-000000004001'::uuid AS user_id,
        CASE WHEN seq % 3 = 0
             THEN '00000000-0000-0000-0000-000000004032'::uuid
             ELSE '00000000-0000-0000-0000-000000004030'::uuid
        END AS account_id,
        NULL::uuid AS to_account_id,
        '00000000-0000-0000-0000-000000004014'::uuid AS category_id,
        NULL::uuid AS goal_id,
        'expense'::varchar(20) AS type,
        (90 + ((seq % 5) * 25))::numeric(12,2) AS amount,
        tx_date AS transaction_date,
        CASE WHEN seq % 4 = 0 THEN 'Metro Card' ELSE 'Fuel Stop' END::varchar(200) AS merchant,
        'Daily commute'::text AS note,
        CASE WHEN seq % 3 = 0 THEN 'cash' ELSE 'upi' END::varchar(50) AS payment_method
    FROM date_series
),
tx_food AS (
    SELECT
        ('00000000-0000-0000-0000-' || LPAD((6000 + seq)::text, 12, '0'))::uuid AS id,
        '00000000-0000-0000-0000-000000004001'::uuid AS user_id,
        '00000000-0000-0000-0000-000000004030'::uuid AS account_id,
        NULL::uuid AS to_account_id,
        CASE WHEN seq % 4 = 0
             THEN '00000000-0000-0000-0000-000000004015'::uuid
             ELSE '00000000-0000-0000-0000-000000004012'::uuid
        END AS category_id,
        NULL::uuid AS goal_id,
        'expense'::varchar(20) AS type,
        CASE WHEN seq % 4 = 0
             THEN (320 + ((seq % 5) * 55))::numeric(12,2)
             ELSE (260 + ((seq % 6) * 45))::numeric(12,2)
        END AS amount,
        tx_date AS transaction_date,
        CASE WHEN seq % 4 = 0 THEN 'Cafe Mosaic' ELSE 'Fresh Basket' END::varchar(200) AS merchant,
        CASE WHEN seq % 4 = 0 THEN 'Dinner outside' ELSE 'Household food stock' END::text AS note,
        'card'::varchar(50) AS payment_method
    FROM date_series
),
tx_lifestyle AS (
    SELECT
        ('00000000-0000-0000-0000-' || LPAD((7000 + seq)::text, 12, '0'))::uuid AS id,
        '00000000-0000-0000-0000-000000004001'::uuid AS user_id,
        CASE WHEN seq % 5 = 0
             THEN '00000000-0000-0000-0000-000000004032'::uuid
             ELSE '00000000-0000-0000-0000-000000004030'::uuid
        END AS account_id,
        NULL::uuid AS to_account_id,
        CASE
            WHEN seq % 5 = 0 THEN '00000000-0000-0000-0000-000000004017'::uuid
            WHEN seq % 5 = 1 THEN '00000000-0000-0000-0000-000000004019'::uuid
            WHEN seq % 5 = 2 THEN '00000000-0000-0000-0000-000000004018'::uuid
            WHEN seq % 5 = 3 THEN '00000000-0000-0000-0000-000000004020'::uuid
            ELSE '00000000-0000-0000-0000-000000004016'::uuid
        END AS category_id,
        NULL::uuid AS goal_id,
        'expense'::varchar(20) AS type,
        CASE
            WHEN seq % 5 = 0 THEN (180 + ((seq % 4) * 90))::numeric(12,2)
            WHEN seq % 5 = 1 THEN (240 + ((seq % 6) * 85))::numeric(12,2)
            WHEN seq % 5 = 2 THEN (150 + ((seq % 3) * 60))::numeric(12,2)
            WHEN seq % 5 = 3 THEN (220 + ((seq % 4) * 140))::numeric(12,2)
            ELSE (130 + ((seq % 5) * 40))::numeric(12,2)
        END AS amount,
        tx_date AS transaction_date,
        CASE
            WHEN seq % 5 = 0 THEN 'Prime Cinema'
            WHEN seq % 5 = 1 THEN 'Urban Cart'
            WHEN seq % 5 = 2 THEN 'Health Plus'
            WHEN seq % 5 = 3 THEN 'Trip Saver'
            ELSE 'Power Grid'
        END::varchar(200) AS merchant,
        'Routine discretionary spending'::text AS note,
        CASE WHEN seq % 5 = 0 THEN 'card' ELSE 'upi' END::varchar(50) AS payment_method
    FROM date_series
),
tx_finance AS (
    SELECT
        ('00000000-0000-0000-0000-' || LPAD((8000 + seq)::text, 12, '0'))::uuid AS id,
        '00000000-0000-0000-0000-000000004001'::uuid AS user_id,
        '00000000-0000-0000-0000-000000004030'::uuid AS account_id,
        CASE WHEN EXTRACT(DAY FROM tx_date) IN (10, 20)
             THEN '00000000-0000-0000-0000-000000004031'::uuid
             ELSE NULL::uuid
        END AS to_account_id,
        CASE
            WHEN tx_date IN (DATE '2026-02-01', DATE '2026-03-01') THEN '00000000-0000-0000-0000-000000004010'::uuid
            WHEN EXTRACT(DAY FROM tx_date) = 15 THEN '00000000-0000-0000-0000-000000004011'::uuid
            WHEN EXTRACT(DAY FROM tx_date) IN (5, 6) THEN '00000000-0000-0000-0000-000000004016'::uuid
            WHEN EXTRACT(DAY FROM tx_date) = 1 THEN '00000000-0000-0000-0000-000000004013'::uuid
            ELSE '00000000-0000-0000-0000-000000004017'::uuid
        END AS category_id,
        NULL::uuid AS goal_id,
        CASE
            WHEN tx_date IN (DATE '2026-02-01', DATE '2026-03-01') THEN 'income'
            WHEN EXTRACT(DAY FROM tx_date) = 15 THEN 'income'
            WHEN EXTRACT(DAY FROM tx_date) IN (10, 20) THEN 'transfer'
            WHEN EXTRACT(DAY FROM tx_date) = 1 THEN 'expense'
            ELSE 'expense'
        END::varchar(20) AS type,
        CASE
            WHEN tx_date IN (DATE '2026-02-01', DATE '2026-03-01') THEN 72000.00::numeric(12,2)
            WHEN EXTRACT(DAY FROM tx_date) = 15 THEN 18500.00::numeric(12,2)
            WHEN EXTRACT(DAY FROM tx_date) IN (10, 20) THEN 4500.00::numeric(12,2)
            WHEN EXTRACT(DAY FROM tx_date) = 1 THEN 24500.00::numeric(12,2)
            ELSE (180 + ((seq % 4) * 70))::numeric(12,2)
        END AS amount,
        tx_date AS transaction_date,
        CASE
            WHEN tx_date IN (DATE '2026-02-01', DATE '2026-03-01') THEN 'BluePeak Technologies'
            WHEN EXTRACT(DAY FROM tx_date) = 15 THEN 'Client Retainer'
            WHEN EXTRACT(DAY FROM tx_date) IN (10, 20) THEN 'Reserve Transfer'
            WHEN EXTRACT(DAY FROM tx_date) = 1 THEN 'Oak Residency'
            ELSE 'Night Stream'
        END::varchar(200) AS merchant,
        CASE
            WHEN tx_date IN (DATE '2026-02-01', DATE '2026-03-01') THEN 'Monthly salary'
            WHEN EXTRACT(DAY FROM tx_date) = 15 THEN 'Freelance payout'
            WHEN EXTRACT(DAY FROM tx_date) IN (10, 20) THEN 'Move money to reserve'
            WHEN EXTRACT(DAY FROM tx_date) = 1 THEN 'Monthly house rent'
            ELSE 'Leisure spend'
        END::text AS note,
        CASE
            WHEN tx_date IN (DATE '2026-02-01', DATE '2026-03-01', DATE '2026-01-15') THEN 'bank_transfer'
            WHEN EXTRACT(DAY FROM tx_date) IN (10, 20) THEN 'bank_transfer'
            ELSE 'card'
        END::varchar(50) AS payment_method
    FROM date_series
),
goal_contributions AS (
    SELECT *
    FROM (
        VALUES
            ('00000000-0000-0000-0000-000000004040'::uuid, '00000000-0000-0000-0000-000000004030'::uuid, '00000000-0000-0000-0000-000000004031'::uuid, DATE '2026-01-20', 5000.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000004041'::uuid, '00000000-0000-0000-0000-000000004030'::uuid, '00000000-0000-0000-0000-000000004031'::uuid, DATE '2026-01-28', 3500.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000004042'::uuid, '00000000-0000-0000-0000-000000004030'::uuid, '00000000-0000-0000-0000-000000004030'::uuid, DATE '2026-02-05', 4200.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000004040'::uuid, '00000000-0000-0000-0000-000000004030'::uuid, '00000000-0000-0000-0000-000000004031'::uuid, DATE '2026-02-14', 6500.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000004041'::uuid, '00000000-0000-0000-0000-000000004031'::uuid, '00000000-0000-0000-0000-000000004031'::uuid, DATE '2026-02-24', 2800.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000004042'::uuid, '00000000-0000-0000-0000-000000004030'::uuid, '00000000-0000-0000-0000-000000004030'::uuid, DATE '2026-03-03', 5600.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000004040'::uuid, '00000000-0000-0000-0000-000000004031'::uuid, '00000000-0000-0000-0000-000000004031'::uuid, DATE '2026-03-11', 4700.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000004041'::uuid, '00000000-0000-0000-0000-000000004030'::uuid, '00000000-0000-0000-0000-000000004031'::uuid, DATE '2026-03-18', 3900.00::numeric(12,2))
    ) AS gc(goal_id, account_id, to_account_id, transaction_date, amount)
),
goal_contribution_transactions AS (
    SELECT
        ('00000000-0000-0000-0000-' || LPAD((9000 + ROW_NUMBER() OVER (ORDER BY transaction_date))::text, 12, '0'))::uuid AS id,
        '00000000-0000-0000-0000-000000004001'::uuid AS user_id,
        gc.account_id,
        gc.to_account_id,
        '00000000-0000-0000-0000-000000004021'::uuid AS category_id,
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
WHERE b.user_id = '00000000-0000-0000-0000-000000004001';

-- Recalculate account balances from all seeded transactions.
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
WHERE a.user_id = '00000000-0000-0000-0000-000000004001';

-- Recalculate goal current amounts from goal contribution transactions.
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
WHERE g.user_id = '00000000-0000-0000-0000-000000004001';
