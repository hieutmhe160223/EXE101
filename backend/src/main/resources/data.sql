INSERT INTO user_accounts (
    email,
    password_hash,
    full_name,
    role,
    phone_number,
    date_of_birth,
    wallet_balance,
    loyalty_points,
    status,
    created_at,
    updated_at
)
VALUES
    (
        'customer@example.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'Demo Customer',
        'CUSTOMER',
        '0901000001',
        '1998-01-15',
        1500000,
        120,
        'ACTIVE',
        NOW(),
        NOW()
    ),
    (
        'test@yufiz.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'Nguyen Van A',
        'CUSTOMER',
        '0912345678',
        '1995-05-20',
        500000,
        35,
        'ACTIVE',
        NOW(),
        NOW()
    ),
    (
        'linh.shop@example.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'Tran Ngoc Linh',
        'CUSTOMER',
        '0934567890',
        '1997-09-10',
        2200000,
        260,
        'ACTIVE',
        NOW(),
        NOW()
    )
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    role = VALUES(role),
    phone_number = VALUES(phone_number),
    date_of_birth = VALUES(date_of_birth),
    wallet_balance = VALUES(wallet_balance),
    loyalty_points = VALUES(loyalty_points),
    status = VALUES(status),
    updated_at = NOW();

UPDATE purchase_orders
SET product_quote_id = NULL
WHERE product_quote_id IN (
    SELECT id
    FROM product_quotes
    WHERE source_url = 'https://2.taobao.com/item.htm?id=666777888'
       OR image_url = 'https://img.alicdn.com/sample.jpg'
       OR shop_name = 'Thoi Trang Store'
);

DELETE FROM product_quotes
WHERE source_url = 'https://2.taobao.com/item.htm?id=666777888'
   OR image_url = 'https://img.alicdn.com/sample.jpg'
   OR shop_name = 'Thoi Trang Store';

INSERT INTO purchase_orders (
    order_code,
    customer_id,
    product_quote_id,
    status,
    quantity,
    total_amount_vnd,
    deposit_amount_vnd,
    final_amount_vnd,
    paid_amount_vnd,
    shipping_address,
    customer_note,
    created_at,
    updated_at
)
SELECT
    CONCAT('DEMO-', ua.id, '-WAITING-DEPOSIT'),
    ua.id,
    NULL,
    'WAITING_DEPOSIT',
    1,
    780000,
    546000,
    234000,
    0,
    CONCAT('Dia chi nhan hang cua ', ua.full_name),
    'Don hang moi cho thanh toan coc.',
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    NOW()
FROM user_accounts ua
WHERE ua.role = 'CUSTOMER'
ON DUPLICATE KEY UPDATE
    customer_id = VALUES(customer_id),
    product_quote_id = NULL,
    status = VALUES(status),
    quantity = VALUES(quantity),
    total_amount_vnd = VALUES(total_amount_vnd),
    deposit_amount_vnd = VALUES(deposit_amount_vnd),
    final_amount_vnd = VALUES(final_amount_vnd),
    paid_amount_vnd = VALUES(paid_amount_vnd),
    shipping_address = VALUES(shipping_address),
    customer_note = VALUES(customer_note),
    updated_at = NOW();

INSERT INTO purchase_orders (
    order_code,
    customer_id,
    product_quote_id,
    status,
    quantity,
    total_amount_vnd,
    deposit_amount_vnd,
    final_amount_vnd,
    paid_amount_vnd,
    shipping_address,
    customer_note,
    created_at,
    updated_at
)
SELECT
    CONCAT('DEMO-', ua.id, '-DEPOSIT-PAID'),
    ua.id,
    NULL,
    'DEPOSIT_PAID',
    2,
    1250000,
    875000,
    375000,
    875000,
    CONCAT('Dia chi nhan hang cua ', ua.full_name),
    'Da thanh toan 70 phan tram tien coc.',
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    NOW()
FROM user_accounts ua
WHERE ua.role = 'CUSTOMER'
ON DUPLICATE KEY UPDATE
    customer_id = VALUES(customer_id),
    product_quote_id = NULL,
    status = VALUES(status),
    quantity = VALUES(quantity),
    total_amount_vnd = VALUES(total_amount_vnd),
    deposit_amount_vnd = VALUES(deposit_amount_vnd),
    final_amount_vnd = VALUES(final_amount_vnd),
    paid_amount_vnd = VALUES(paid_amount_vnd),
    shipping_address = VALUES(shipping_address),
    customer_note = VALUES(customer_note),
    updated_at = NOW();

INSERT INTO purchase_orders (
    order_code,
    customer_id,
    product_quote_id,
    status,
    quantity,
    total_amount_vnd,
    deposit_amount_vnd,
    final_amount_vnd,
    paid_amount_vnd,
    shipping_address,
    customer_note,
    created_at,
    updated_at
)
SELECT
    CONCAT('DEMO-', ua.id, '-COMPLETED'),
    ua.id,
    NULL,
    'COMPLETED',
    1,
    2140000,
    1498000,
    642000,
    2140000,
    CONCAT('Dia chi nhan hang cua ', ua.full_name),
    'Don hang demo da hoan thanh.',
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    NOW()
FROM user_accounts ua
WHERE ua.role = 'CUSTOMER'
ON DUPLICATE KEY UPDATE
    customer_id = VALUES(customer_id),
    product_quote_id = NULL,
    status = VALUES(status),
    quantity = VALUES(quantity),
    total_amount_vnd = VALUES(total_amount_vnd),
    deposit_amount_vnd = VALUES(deposit_amount_vnd),
    final_amount_vnd = VALUES(final_amount_vnd),
    paid_amount_vnd = VALUES(paid_amount_vnd),
    shipping_address = VALUES(shipping_address),
    customer_note = VALUES(customer_note),
    updated_at = NOW();

INSERT INTO order_status_histories (
    order_id,
    status,
    location,
    note,
    created_at,
    updated_at
)
SELECT
    po.id,
    'DEPOSIT_PAID',
    'He thong',
    'Khach hang da thanh toan tien coc.',
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    NOW()
FROM purchase_orders po
WHERE po.order_code LIKE 'DEMO-%-DEPOSIT-PAID'
  AND NOT EXISTS (
      SELECT 1
      FROM order_status_histories osh
      WHERE osh.order_id = po.id
        AND osh.status = 'DEPOSIT_PAID'
  );

INSERT INTO order_status_histories (
    order_id,
    status,
    location,
    note,
    created_at,
    updated_at
)
SELECT
    po.id,
    stages.status,
    stages.location,
    stages.note,
    DATE_SUB(NOW(), INTERVAL stages.days_ago DAY),
    NOW()
FROM purchase_orders po
JOIN (
    SELECT 'DEPOSIT_PAID' AS status, 'He thong' AS location, 'Khach hang da thanh toan tien coc.' AS note, 20 AS days_ago
    UNION ALL SELECT 'PURCHASED', 'Shubop', 'Da mua hang tu shop Trung Quoc.', 18
    UNION ALL SELECT 'SHOP_SHIPPING', 'Trung Quoc', 'Shop dang giao ve kho Trung Quoc.', 16
    UNION ALL SELECT 'CHINA_WAREHOUSE', 'Kho Trung Quoc', 'Hang da ve kho Trung Quoc.', 13
    UNION ALL SELECT 'INTERNATIONAL_SHIPPING', 'Van chuyen quoc te', 'Hang dang van chuyen ve Viet Nam.', 10
    UNION ALL SELECT 'VIETNAM_WAREHOUSE', 'Kho Viet Nam', 'Hang da ve kho Viet Nam.', 6
    UNION ALL SELECT 'WAITING_FINAL_PAYMENT', 'Kho Viet Nam', 'Cho thanh toan phan con lai.', 5
    UNION ALL SELECT 'FINAL_PAID', 'He thong', 'Khach hang da thanh toan so tien con lai.', 4
    UNION ALL SELECT 'DELIVERING', 'Viet Nam', 'Dang giao hang den khach.', 2
    UNION ALL SELECT 'COMPLETED', 'Viet Nam', 'Don hang da hoan thanh.', 1
) stages
WHERE po.order_code LIKE 'DEMO-%-COMPLETED'
  AND NOT EXISTS (
      SELECT 1
      FROM order_status_histories osh
      WHERE osh.order_id = po.id
        AND osh.status = stages.status
  );

INSERT INTO payment_transactions (
    order_id,
    payer_id,
    type,
    method,
    status,
    amount_vnd,
    provider_transaction_code,
    paid_at,
    created_at,
    updated_at
)
SELECT
    po.id,
    po.customer_id,
    'DEPOSIT_70',
    'BANK_TRANSFER',
    'PAID',
    po.deposit_amount_vnd,
    CONCAT(po.order_code, '-DEPOSIT'),
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    NOW()
FROM purchase_orders po
WHERE po.order_code LIKE 'DEMO-%-DEPOSIT-PAID'
  AND NOT EXISTS (
      SELECT 1
      FROM payment_transactions pt
      WHERE pt.order_id = po.id
        AND pt.type = 'DEPOSIT_70'
        AND pt.provider_transaction_code = CONCAT(po.order_code, '-DEPOSIT')
  );

INSERT INTO payment_transactions (
    order_id,
    payer_id,
    type,
    method,
    status,
    amount_vnd,
    provider_transaction_code,
    paid_at,
    created_at,
    updated_at
)
SELECT
    po.id,
    po.customer_id,
    'DEPOSIT_70',
    'BANK_TRANSFER',
    'PAID',
    po.deposit_amount_vnd,
    CONCAT(po.order_code, '-DEPOSIT'),
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    NOW()
FROM purchase_orders po
WHERE po.order_code LIKE 'DEMO-%-COMPLETED'
  AND NOT EXISTS (
      SELECT 1
      FROM payment_transactions pt
      WHERE pt.order_id = po.id
        AND pt.type = 'DEPOSIT_70'
        AND pt.provider_transaction_code = CONCAT(po.order_code, '-DEPOSIT')
  );

INSERT INTO payment_transactions (
    order_id,
    payer_id,
    type,
    method,
    status,
    amount_vnd,
    provider_transaction_code,
    paid_at,
    created_at,
    updated_at
)
SELECT
    po.id,
    po.customer_id,
    'FINAL_30',
    'MOMO',
    'PAID',
    po.final_amount_vnd,
    CONCAT(po.order_code, '-FINAL'),
    DATE_SUB(NOW(), INTERVAL 4 DAY),
    DATE_SUB(NOW(), INTERVAL 4 DAY),
    NOW()
FROM purchase_orders po
WHERE po.order_code LIKE 'DEMO-%-COMPLETED'
  AND NOT EXISTS (
      SELECT 1
      FROM payment_transactions pt
      WHERE pt.order_id = po.id
        AND pt.type = 'FINAL_30'
        AND pt.provider_transaction_code = CONCAT(po.order_code, '-FINAL')
  );

INSERT INTO purchase_orders (
    order_code,
    customer_id,
    product_quote_id,
    status,
    quantity,
    total_amount_vnd,
    deposit_amount_vnd,
    final_amount_vnd,
    paid_amount_vnd,
    shipping_address,
    customer_note,
    created_at,
    updated_at
)
SELECT
    seed.order_code,
    ua.id,
    NULL,
    seed.status,
    seed.quantity,
    seed.total_amount_vnd,
    seed.deposit_amount_vnd,
    seed.final_amount_vnd,
    seed.paid_amount_vnd,
    'So 12 Nguyen Trai, Quan 1, TP HCM',
    seed.customer_note,
    DATE_SUB(NOW(), INTERVAL seed.days_ago DAY),
    NOW()
FROM user_accounts ua
JOIN (
    SELECT 'CUST2-WAITING-DEPOSIT' AS order_code, 'WAITING_DEPOSIT' AS status, 1 AS quantity, 860000 AS total_amount_vnd, 602000 AS deposit_amount_vnd, 258000 AS final_amount_vnd, 0 AS paid_amount_vnd, 'Don hang id 2 dang cho thanh toan tien coc.' AS customer_note, 1 AS days_ago
    UNION ALL SELECT 'CUST2-DEPOSIT-PAID', 'DEPOSIT_PAID', 2, 1380000, 966000, 414000, 966000, 'Don hang id 2 da thanh toan tien coc.', 5
    UNION ALL SELECT 'CUST2-WAITING-FINAL', 'WAITING_FINAL_PAYMENT', 1, 1750000, 1225000, 525000, 1225000, 'Hang da ve kho Viet Nam, cho thanh toan phan con lai.', 12
    UNION ALL SELECT 'CUST2-COMPLETED', 'COMPLETED', 3, 2490000, 1743000, 747000, 2490000, 'Don hang id 2 da hoan thanh.', 25
) seed
WHERE ua.id = 2
  AND ua.role = 'CUSTOMER'
ON DUPLICATE KEY UPDATE
    customer_id = VALUES(customer_id),
    product_quote_id = NULL,
    status = VALUES(status),
    quantity = VALUES(quantity),
    total_amount_vnd = VALUES(total_amount_vnd),
    deposit_amount_vnd = VALUES(deposit_amount_vnd),
    final_amount_vnd = VALUES(final_amount_vnd),
    paid_amount_vnd = VALUES(paid_amount_vnd),
    shipping_address = VALUES(shipping_address),
    customer_note = VALUES(customer_note),
    updated_at = NOW();

INSERT INTO order_status_histories (
    order_id,
    status,
    location,
    note,
    created_at,
    updated_at
)
SELECT
    po.id,
    stages.status,
    stages.location,
    stages.note,
    DATE_SUB(NOW(), INTERVAL stages.days_ago DAY),
    NOW()
FROM purchase_orders po
JOIN (
    SELECT 'CUST2-DEPOSIT-PAID' AS order_code, 'DEPOSIT_PAID' AS status, 'He thong' AS location, 'Khach hang id 2 da thanh toan tien coc.' AS note, 5 AS days_ago
    UNION ALL SELECT 'CUST2-WAITING-FINAL', 'DEPOSIT_PAID', 'He thong', 'Khach hang id 2 da thanh toan tien coc.', 12
    UNION ALL SELECT 'CUST2-WAITING-FINAL', 'PURCHASED', 'Shubop', 'Da mua hang tu shop Trung Quoc.', 10
    UNION ALL SELECT 'CUST2-WAITING-FINAL', 'SHOP_SHIPPING', 'Trung Quoc', 'Shop dang giao ve kho Trung Quoc.', 9
    UNION ALL SELECT 'CUST2-WAITING-FINAL', 'CHINA_WAREHOUSE', 'Kho Trung Quoc', 'Hang da ve kho Trung Quoc.', 7
    UNION ALL SELECT 'CUST2-WAITING-FINAL', 'INTERNATIONAL_SHIPPING', 'Van chuyen quoc te', 'Hang dang van chuyen ve Viet Nam.', 5
    UNION ALL SELECT 'CUST2-WAITING-FINAL', 'VIETNAM_WAREHOUSE', 'Kho Viet Nam', 'Hang da ve kho Viet Nam.', 2
    UNION ALL SELECT 'CUST2-WAITING-FINAL', 'WAITING_FINAL_PAYMENT', 'Kho Viet Nam', 'Cho thanh toan 30 phan tram con lai.', 1
    UNION ALL SELECT 'CUST2-COMPLETED', 'DEPOSIT_PAID', 'He thong', 'Khach hang id 2 da thanh toan tien coc.', 25
    UNION ALL SELECT 'CUST2-COMPLETED', 'PURCHASED', 'Shubop', 'Da mua hang tu shop Trung Quoc.', 23
    UNION ALL SELECT 'CUST2-COMPLETED', 'SHOP_SHIPPING', 'Trung Quoc', 'Shop dang giao ve kho Trung Quoc.', 21
    UNION ALL SELECT 'CUST2-COMPLETED', 'CHINA_WAREHOUSE', 'Kho Trung Quoc', 'Hang da ve kho Trung Quoc.', 18
    UNION ALL SELECT 'CUST2-COMPLETED', 'INTERNATIONAL_SHIPPING', 'Van chuyen quoc te', 'Hang dang van chuyen ve Viet Nam.', 14
    UNION ALL SELECT 'CUST2-COMPLETED', 'VIETNAM_WAREHOUSE', 'Kho Viet Nam', 'Hang da ve kho Viet Nam.', 9
    UNION ALL SELECT 'CUST2-COMPLETED', 'WAITING_FINAL_PAYMENT', 'Kho Viet Nam', 'Cho thanh toan 30 phan tram con lai.', 8
    UNION ALL SELECT 'CUST2-COMPLETED', 'FINAL_PAID', 'He thong', 'Khach hang id 2 da thanh toan phan con lai.', 7
    UNION ALL SELECT 'CUST2-COMPLETED', 'DELIVERING', 'Viet Nam', 'Dang giao hang den khach.', 4
    UNION ALL SELECT 'CUST2-COMPLETED', 'COMPLETED', 'Viet Nam', 'Don hang da hoan thanh.', 2
) stages ON stages.order_code = po.order_code
WHERE po.customer_id = 2
  AND NOT EXISTS (
      SELECT 1
      FROM order_status_histories osh
      WHERE osh.order_id = po.id
        AND osh.status = stages.status
  );

INSERT INTO payment_transactions (
    order_id,
    payer_id,
    type,
    method,
    status,
    amount_vnd,
    provider_transaction_code,
    paid_at,
    created_at,
    updated_at
)
SELECT
    po.id,
    po.customer_id,
    payments.type,
    payments.method,
    'PAID',
    payments.amount_vnd,
    CONCAT(po.order_code, payments.code_suffix),
    DATE_SUB(NOW(), INTERVAL payments.days_ago DAY),
    DATE_SUB(NOW(), INTERVAL payments.days_ago DAY),
    NOW()
FROM purchase_orders po
JOIN (
    SELECT 'CUST2-DEPOSIT-PAID' AS order_code, 'DEPOSIT_70' AS type, 'BANK_TRANSFER' AS method, 966000 AS amount_vnd, '-DEPOSIT' AS code_suffix, 5 AS days_ago
    UNION ALL SELECT 'CUST2-WAITING-FINAL', 'DEPOSIT_70', 'BANK_TRANSFER', 1225000, '-DEPOSIT', 12
    UNION ALL SELECT 'CUST2-COMPLETED', 'DEPOSIT_70', 'BANK_TRANSFER', 1743000, '-DEPOSIT', 25
    UNION ALL SELECT 'CUST2-COMPLETED', 'FINAL_30', 'MOMO', 747000, '-FINAL', 7
) payments ON payments.order_code = po.order_code
WHERE po.customer_id = 2
  AND NOT EXISTS (
      SELECT 1
      FROM payment_transactions pt
      WHERE pt.order_id = po.id
        AND pt.type = payments.type
        AND pt.provider_transaction_code = CONCAT(po.order_code, payments.code_suffix)
  );
