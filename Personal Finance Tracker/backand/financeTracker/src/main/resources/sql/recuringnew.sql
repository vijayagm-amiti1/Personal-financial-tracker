INSERT INTO recurring_transactions (
    id, user_id, title, type, amount, category_id, account_id,
    frequency, start_date, end_date, next_run_date, auto_create_transaction
)
VALUES
    (
        '00000000-0000-0000-0000-000000005205',
        'c33ba49d-9cb7-4885-b41b-813234ffaa9b',
        'Weekly Movie Night',
        'expense',
        650.00,
        '00000000-0000-0000-0000-000000005018',
        '00000000-0000-0000-0000-000000005031',
        'weekly',
        DATE '2026-03-19',
        NULL,
        DATE '2026-03-26',
        true
    ),
    (
        '00000000-0000-0000-0000-000000005206',
        'c33ba49d-9cb7-4885-b41b-813234ffaa9b',
        'Weekly Shopping Run',
        'expense',
        1200.00,
        '00000000-0000-0000-0000-000000005020',
        '00000000-0000-0000-0000-000000005030',
        'weekly',
        DATE '2026-03-19',
        NULL,
        DATE '2026-03-26',
        true
    ),
    (
        '00000000-0000-0000-0000-000000005207',
        'c33ba49d-9cb7-4885-b41b-813234ffaa9b',
        'Rapido Weekly Payout',
        'income',
        4200.00,
        '00000000-0000-0000-0000-000000005011',
        '00000000-0000-0000-0000-000000005030',
        'weekly',
        DATE '2026-03-19',
        NULL,
        DATE '2026-03-26',
        true
    );
