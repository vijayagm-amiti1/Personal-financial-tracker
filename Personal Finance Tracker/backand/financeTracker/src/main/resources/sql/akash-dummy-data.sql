-- Akash seed data for Personal Finance Tracker
-- Covers one user with 3 accounts, 6 budgets, 3 goals, 8 goal contributions,
-- and 100+ transactions between 2026-02-15 and 2026-03-15.

-- User
INSERT INTO users (id, email, password_hash, display_name, created_at)
VALUES (
    '00000000-0000-0000-0000-000000002001',
    'akash@financetracker.local',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M8rXH1Y8gJ5x1n3lN0K6rOeW4v4K',
    'akash',
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name;

-- Categories
INSERT INTO categories (id, user_id, name, type, color, icon, is_archived)
VALUES
    ('00000000-0000-0000-0000-000000002010', '00000000-0000-0000-0000-000000002001', 'Salary', 'income', '#1B5E20', 'briefcase', false),
    ('00000000-0000-0000-0000-000000002011', '00000000-0000-0000-0000-000000002001', 'Bonus', 'income', '#2E7D32', 'payments', false),
    ('00000000-0000-0000-0000-000000002012', '00000000-0000-0000-0000-000000002001', 'Groceries', 'expense', '#C62828', 'shopping-basket', false),
    ('00000000-0000-0000-0000-000000002013', '00000000-0000-0000-0000-000000002001', 'Rent', 'expense', '#6A1B9A', 'home', false),
    ('00000000-0000-0000-0000-000000002014', '00000000-0000-0000-0000-000000002001', 'Transport', 'expense', '#1565C0', 'directions-car', false),
    ('00000000-0000-0000-0000-000000002015', '00000000-0000-0000-0000-000000002001', 'Dining Out', 'expense', '#EF6C00', 'restaurant', false),
    ('00000000-0000-0000-0000-000000002016', '00000000-0000-0000-0000-000000002001', 'Utilities', 'expense', '#455A64', 'bolt', false),
    ('00000000-0000-0000-0000-000000002017', '00000000-0000-0000-0000-000000002001', 'Entertainment', 'expense', '#AD1457', 'movie', false),
    ('00000000-0000-0000-0000-000000002018', '00000000-0000-0000-0000-000000002001', 'Medical', 'expense', '#00838F', 'favorite', false),
    ('00000000-0000-0000-0000-000000002019', '00000000-0000-0000-0000-000000002001', 'Goal Funding', 'expense', '#4E342E', 'savings', false)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    type = EXCLUDED.type,
    color = EXCLUDED.color,
    icon = EXCLUDED.icon,
    is_archived = EXCLUDED.is_archived;

-- Accounts
INSERT INTO accounts (id, user_id, name, type, opening_balance, current_balance, institution_name, created_at)
VALUES
    ('00000000-0000-0000-0000-000000002020', '00000000-0000-0000-0000-000000002001', 'akash_axis_primary', 'checking', 145000.00, 145000.00, 'Axis Bank', NOW()),
    ('00000000-0000-0000-0000-000000002021', '00000000-0000-0000-0000-000000002001', 'akash_icici_reserve', 'savings', 78000.00, 78000.00, 'ICICI Bank', NOW()),
    ('00000000-0000-0000-0000-000000002022', '00000000-0000-0000-0000-000000002001', 'akash_wallet_cash', 'cash', 9000.00, 9000.00, 'Cash Wallet', NOW())
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    type = EXCLUDED.type,
    opening_balance = EXCLUDED.opening_balance,
    institution_name = EXCLUDED.institution_name;

-- Budgets
INSERT INTO budgets (id, user_id, category_id, month, year, amount, current_spent, alert_threshold_percent)
VALUES
    ('00000000-0000-0000-0000-000000002040', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000002012', 3, 2026, 15000.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000002041', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000002013', 3, 2026, 22000.00, 0.00, 90),
    ('00000000-0000-0000-0000-000000002042', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000002014', 3, 2026, 3500.00, 0.00, 80),
    ('00000000-0000-0000-0000-000000002043', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000002015', 3, 2026, 7000.00, 0.00, 75),
    ('00000000-0000-0000-0000-000000002044', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000002016', 3, 2026, 4500.00, 0.00, 85),
    ('00000000-0000-0000-0000-000000002045', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000002017', 3, 2026, 6000.00, 0.00, 80)
ON CONFLICT (id) DO UPDATE
SET category_id = EXCLUDED.category_id,
    month = EXCLUDED.month,
    year = EXCLUDED.year,
    amount = EXCLUDED.amount,
    current_spent = EXCLUDED.current_spent,
    alert_threshold_percent = EXCLUDED.alert_threshold_percent;

-- Goals
INSERT INTO goals (id, user_id, name, target_amount, current_amount, target_date, linked_account_id, status)
VALUES
    ('00000000-0000-0000-0000-000000002030', '00000000-0000-0000-0000-000000002001', 'Emergency Corpus', 180000.00, 0.00, DATE '2026-12-31', '00000000-0000-0000-0000-000000002021', 'active'),
    ('00000000-0000-0000-0000-000000002031', '00000000-0000-0000-0000-000000002001', 'Japan Trip', 95000.00, 0.00, DATE '2026-11-15', '00000000-0000-0000-0000-000000002021', 'active'),
    ('00000000-0000-0000-0000-000000002032', '00000000-0000-0000-0000-000000002001', 'Studio Laptop', 135000.00, 0.00, DATE '2026-10-30', '00000000-0000-0000-0000-000000002020', 'active')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    target_amount = EXCLUDED.target_amount,
    target_date = EXCLUDED.target_date,
    linked_account_id = EXCLUDED.linked_account_id,
    status = EXCLUDED.status;

-- Generated daily and recurring transactions
WITH date_series AS (
    SELECT gs::date AS tx_date, ROW_NUMBER() OVER (ORDER BY gs) AS seq
    FROM generate_series(DATE '2026-02-15', DATE '2026-03-15', INTERVAL '1 day') AS gs
),
base_transactions AS (
    SELECT
        ('00000000-0000-0000-0000-' || LPAD((3000 + seq)::text, 12, '0'))::uuid AS id,
        '00000000-0000-0000-0000-000000002001'::uuid AS user_id,
        '00000000-0000-0000-0000-000000002020'::uuid AS account_id,
        NULL::uuid AS to_account_id,
        '00000000-0000-0000-0000-000000002012'::uuid AS category_id,
        NULL::uuid AS goal_id,
        'expense'::varchar(20) AS type,
        (360 + ((seq * 17) % 160))::numeric(12,2) AS amount,
        tx_date AS transaction_date,
        'Fresh Market'::varchar(200) AS merchant,
        'Household groceries'::text AS note,
        'upi'::varchar(50) AS payment_method
    FROM date_series

    UNION ALL

    SELECT
        ('00000000-0000-0000-0000-' || LPAD((4000 + seq)::text, 12, '0'))::uuid,
        '00000000-0000-0000-0000-000000002001'::uuid,
        '00000000-0000-0000-0000-000000002022'::uuid,
        NULL::uuid,
        '00000000-0000-0000-0000-000000002014'::uuid,
        NULL::uuid,
        'expense',
        (80 + ((seq * 9) % 55))::numeric(12,2),
        tx_date,
        'Metro Travel Card',
        'Local commute',
        'cash'
    FROM date_series

    UNION ALL

    SELECT
        ('00000000-0000-0000-0000-' || LPAD((5000 + seq)::text, 12, '0'))::uuid,
        '00000000-0000-0000-0000-000000002001'::uuid,
        '00000000-0000-0000-0000-000000002020'::uuid,
        NULL::uuid,
        '00000000-0000-0000-0000-000000002015'::uuid,
        NULL::uuid,
        'expense',
        (150 + ((seq * 11) % 145))::numeric(12,2),
        tx_date,
        'Cafe Junction',
        'Meals and coffee',
        'card'
    FROM date_series

    UNION ALL

    SELECT
        ('00000000-0000-0000-0000-' || LPAD((6000 + seq)::text, 12, '0'))::uuid,
        '00000000-0000-0000-0000-000000002001'::uuid,
        '00000000-0000-0000-0000-000000002020'::uuid,
        NULL::uuid,
        '00000000-0000-0000-0000-000000002017'::uuid,
        NULL::uuid,
        'expense',
        (210 + ((seq * 7) % 190))::numeric(12,2),
        tx_date,
        'Weekend Fun',
        'Movies and streaming',
        'card'
    FROM date_series
    WHERE MOD(seq - 1, 2) = 0

    UNION ALL

    SELECT
        ('00000000-0000-0000-0000-' || LPAD((7000 + seq)::text, 12, '0'))::uuid,
        '00000000-0000-0000-0000-000000002001'::uuid,
        '00000000-0000-0000-0000-000000002020'::uuid,
        NULL::uuid,
        '00000000-0000-0000-0000-000000002016'::uuid,
        NULL::uuid,
        'expense',
        (280 + ((seq * 5) % 120))::numeric(12,2),
        tx_date,
        'Utility Hub',
        'Electricity and internet',
        'upi'
    FROM date_series
    WHERE MOD(seq - 1, 3) = 0

    UNION ALL

    SELECT
        ('00000000-0000-0000-0000-' || LPAD((8000 + seq)::text, 12, '0'))::uuid,
        '00000000-0000-0000-0000-000000002001'::uuid,
        '00000000-0000-0000-0000-000000002021'::uuid,
        NULL::uuid,
        '00000000-0000-0000-0000-000000002018'::uuid,
        NULL::uuid,
        'expense',
        (340 + ((seq * 13) % 170))::numeric(12,2),
        tx_date,
        'Health Plus',
        'Medicines and checkups',
        'card'
    FROM date_series
    WHERE MOD(seq - 1, 4) = 0
),
fixed_transactions AS (
    SELECT *
    FROM (
        VALUES
            ('00000000-0000-0000-0000-000000002901'::uuid, '00000000-0000-0000-0000-000000002001'::uuid, '00000000-0000-0000-0000-000000002020'::uuid, NULL::uuid, '00000000-0000-0000-0000-000000002010'::uuid, NULL::uuid, 'income', 52000.00::numeric(12,2), DATE '2026-02-15', 'Vertex Labs', 'Salary credit', 'bank_transfer'),
            ('00000000-0000-0000-0000-000000002902'::uuid, '00000000-0000-0000-0000-000000002001'::uuid, '00000000-0000-0000-0000-000000002021'::uuid, NULL::uuid, '00000000-0000-0000-0000-000000002011'::uuid, NULL::uuid, 'income', 18500.00::numeric(12,2), DATE '2026-02-21', 'Freelance Client', 'Backend milestone payment', 'bank_transfer'),
            ('00000000-0000-0000-0000-000000002903'::uuid, '00000000-0000-0000-0000-000000002001'::uuid, '00000000-0000-0000-0000-000000002020'::uuid, NULL::uuid, '00000000-0000-0000-0000-000000002010'::uuid, NULL::uuid, 'income', 54000.00::numeric(12,2), DATE '2026-03-01', 'Vertex Labs', 'Monthly salary', 'bank_transfer'),
            ('00000000-0000-0000-0000-000000002904'::uuid, '00000000-0000-0000-0000-000000002001'::uuid, '00000000-0000-0000-0000-000000002021'::uuid, NULL::uuid, '00000000-0000-0000-0000-000000002011'::uuid, NULL::uuid, 'income', 21000.00::numeric(12,2), DATE '2026-03-09', 'Consulting Client', 'Quarterly consulting payout', 'bank_transfer'),
            ('00000000-0000-0000-0000-000000002905'::uuid, '00000000-0000-0000-0000-000000002001'::uuid, '00000000-0000-0000-0000-000000002020'::uuid, NULL::uuid, '00000000-0000-0000-0000-000000002013'::uuid, NULL::uuid, 'expense', 22000.00::numeric(12,2), DATE '2026-02-16', 'Silver Heights', 'Monthly rent payment', 'bank_transfer'),
            ('00000000-0000-0000-0000-000000002906'::uuid, '00000000-0000-0000-0000-000000002001'::uuid, '00000000-0000-0000-0000-000000002020'::uuid, NULL::uuid, '00000000-0000-0000-0000-000000002013'::uuid, NULL::uuid, 'expense', 22000.00::numeric(12,2), DATE '2026-03-15', 'Silver Heights', 'Monthly rent payment', 'bank_transfer'),
            ('00000000-0000-0000-0000-000000002907'::uuid, '00000000-0000-0000-0000-000000002001'::uuid, '00000000-0000-0000-0000-000000002020'::uuid, '00000000-0000-0000-0000-000000002021'::uuid, NULL::uuid, NULL::uuid, 'transfer', 9000.00::numeric(12,2), DATE '2026-02-18', 'Internal Transfer', 'Moved salary surplus to savings', 'bank_transfer'),
            ('00000000-0000-0000-0000-000000002908'::uuid, '00000000-0000-0000-0000-000000002001'::uuid, '00000000-0000-0000-0000-000000002021'::uuid, '00000000-0000-0000-0000-000000002022'::uuid, NULL::uuid, NULL::uuid, 'transfer', 3500.00::numeric(12,2), DATE '2026-02-26', 'Cash Withdrawal', 'Weekend cash requirement', 'bank_transfer'),
            ('00000000-0000-0000-0000-000000002909'::uuid, '00000000-0000-0000-0000-000000002001'::uuid, '00000000-0000-0000-0000-000000002020'::uuid, '00000000-0000-0000-0000-000000002021'::uuid, NULL::uuid, NULL::uuid, 'transfer', 12000.00::numeric(12,2), DATE '2026-03-10', 'Internal Transfer', 'Shifted extra funds to reserve account', 'bank_transfer')
    ) AS f(id, user_id, account_id, to_account_id, category_id, goal_id, type, amount, transaction_date, merchant, note, payment_method)
),
goal_contributions AS (
    SELECT *
    FROM (
        VALUES
            ('00000000-0000-0000-0000-000000002950'::uuid, DATE '2026-02-19', '00000000-0000-0000-0000-000000002020'::uuid, '00000000-0000-0000-0000-000000002030'::uuid, 3000.00::numeric(12,2), 'Emergency Corpus'),
            ('00000000-0000-0000-0000-000000002951'::uuid, DATE '2026-02-23', '00000000-0000-0000-0000-000000002021'::uuid, '00000000-0000-0000-0000-000000002031'::uuid, 2200.00::numeric(12,2), 'Japan Trip'),
            ('00000000-0000-0000-0000-000000002952'::uuid, DATE '2026-02-25', '00000000-0000-0000-0000-000000002020'::uuid, '00000000-0000-0000-0000-000000002032'::uuid, 2600.00::numeric(12,2), 'Studio Laptop'),
            ('00000000-0000-0000-0000-000000002953'::uuid, DATE '2026-03-02', '00000000-0000-0000-0000-000000002020'::uuid, '00000000-0000-0000-0000-000000002030'::uuid, 3500.00::numeric(12,2), 'Emergency Corpus'),
            ('00000000-0000-0000-0000-000000002954'::uuid, DATE '2026-03-04', '00000000-0000-0000-0000-000000002021'::uuid, '00000000-0000-0000-0000-000000002031'::uuid, 2800.00::numeric(12,2), 'Japan Trip'),
            ('00000000-0000-0000-0000-000000002955'::uuid, DATE '2026-03-07', '00000000-0000-0000-0000-000000002020'::uuid, '00000000-0000-0000-0000-000000002032'::uuid, 3200.00::numeric(12,2), 'Studio Laptop'),
            ('00000000-0000-0000-0000-000000002956'::uuid, DATE '2026-03-11', '00000000-0000-0000-0000-000000002021'::uuid, '00000000-0000-0000-0000-000000002030'::uuid, 4000.00::numeric(12,2), 'Emergency Corpus'),
            ('00000000-0000-0000-0000-000000002957'::uuid, DATE '2026-03-14', '00000000-0000-0000-0000-000000002022'::uuid, '00000000-0000-0000-0000-000000002031'::uuid, 1700.00::numeric(12,2), 'Japan Trip')
    ) AS gc(id, transaction_date, account_id, goal_id, amount, goal_name)
),
goal_contribution_transactions AS (
    SELECT
        gc.id,
        '00000000-0000-0000-0000-000000002001'::uuid AS user_id,
        gc.account_id,
        g.linked_account_id AS to_account_id,
        '00000000-0000-0000-0000-000000002019'::uuid AS category_id,
        gc.goal_id,
        'goal_contribution'::varchar(20) AS type,
        gc.amount,
        gc.transaction_date,
        gc.goal_name::varchar(200) AS merchant,
        ('Contribution to ' || gc.goal_name)::text AS note,
        'goal_contribution'::varchar(50) AS payment_method
    FROM goal_contributions gc
    JOIN goals g ON g.id = gc.goal_id
)
INSERT INTO transactions (
    id, user_id, account_id, to_account_id, category_id, goal_id, type, amount,
    transaction_date, merchant, note, payment_method, created_at, updated_at
)
SELECT id, user_id, account_id, to_account_id, category_id, goal_id, type, amount,
       transaction_date, merchant, note, payment_method, NOW(), NOW()
FROM (
    SELECT * FROM base_transactions
    UNION ALL
    SELECT * FROM fixed_transactions
    UNION ALL
    SELECT * FROM goal_contribution_transactions
) AS seeded_transactions
ON CONFLICT (id) DO NOTHING;

UPDATE budgets b
SET current_spent = COALESCE((
    SELECT SUM(t.amount)
    FROM transactions t
    WHERE t.user_id = b.user_id
      AND t.category_id = b.category_id
      AND t.type = 'expense'
      AND EXTRACT(MONTH FROM t.transaction_date) = b.month
      AND EXTRACT(YEAR FROM t.transaction_date) = b.year
), 0)
WHERE b.user_id = '00000000-0000-0000-0000-000000002001';

-- Recalculate account balances from seeded transactions so they always remain consistent.
UPDATE accounts a
SET current_balance =
    a.opening_balance
    + COALESCE((
        SELECT SUM(t.amount) FROM transactions t
        WHERE t.user_id = '00000000-0000-0000-0000-000000002001'
          AND t.account_id = a.id
          AND t.type = 'income'
    ), 0)
    - COALESCE((
        SELECT SUM(t.amount) FROM transactions t
        WHERE t.user_id = '00000000-0000-0000-0000-000000002001'
          AND t.account_id = a.id
          AND t.type IN ('expense', 'transfer')
    ), 0)
    - COALESCE((
        SELECT SUM(t.amount) FROM transactions t
        WHERE t.user_id = '00000000-0000-0000-0000-000000002001'
          AND t.account_id = a.id
          AND t.type = 'goal_contribution'
          AND t.to_account_id IS NOT NULL
          AND t.to_account_id <> t.account_id
    ), 0)
    + COALESCE((
        SELECT SUM(t.amount) FROM transactions t
        WHERE t.user_id = '00000000-0000-0000-0000-000000002001'
          AND t.to_account_id = a.id
          AND t.type = 'transfer'
    ), 0)
    + COALESCE((
        SELECT SUM(t.amount) FROM transactions t
        WHERE t.user_id = '00000000-0000-0000-0000-000000002001'
          AND t.to_account_id = a.id
          AND t.type = 'goal_contribution'
          AND t.to_account_id <> t.account_id
    ), 0)
WHERE a.user_id = '00000000-0000-0000-0000-000000002001';

-- Update goal current amounts from explicit goal contribution transactions.
WITH contribution_totals AS (
    SELECT
        gc.goal_id,
        SUM(gc.amount) AS total_amount
    FROM (
        VALUES
            ('00000000-0000-0000-0000-000000002030'::uuid, 3000.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000002031'::uuid, 2200.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000002032'::uuid, 2600.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000002030'::uuid, 3500.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000002031'::uuid, 2800.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000002032'::uuid, 3200.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000002030'::uuid, 4000.00::numeric(12,2)),
            ('00000000-0000-0000-0000-000000002031'::uuid, 1700.00::numeric(12,2))
    ) AS gc(goal_id, amount)
    GROUP BY gc.goal_id
)
UPDATE goals g
SET current_amount = COALESCE(ct.total_amount, 0),
    status = CASE
        WHEN COALESCE(ct.total_amount, 0) >= g.target_amount THEN 'completed'
        ELSE 'active'
    END
FROM contribution_totals ct
WHERE g.id = ct.goal_id
  AND g.user_id = '00000000-0000-0000-0000-000000002001';
