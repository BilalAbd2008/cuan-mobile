CREATE TABLE IF NOT EXISTS transactions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id INT UNSIGNED NULL,
  title VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  amount DECIMAL(14, 2) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  quantity INT UNSIGNED NULL,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_transactions_date (transaction_date),
  INDEX idx_transactions_product (product_id)
);

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  hpp_cost DECIMAL(14, 2) NOT NULL,
  sell_price DECIMAL(14, 2) NOT NULL,
  image_path VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS hpp_calculations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(120) NOT NULL,
  production_qty INT UNSIGNED NOT NULL,
  total_material_cost DECIMAL(14, 2) NOT NULL,
  total_operational_cost DECIMAL(14, 2) NOT NULL,
  hpp_per_portion DECIMAL(14, 2) NOT NULL,
  margin_percent INT UNSIGNED NOT NULL,
  suggested_price DECIMAL(14, 2) NOT NULL,
  raw_materials JSON NOT NULL,
  operational_costs JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO products (name, hpp_cost, sell_price, image_path) VALUES
('Nasi goreng seafood', 18000, 25000, '/assets/seafood.png'),
('Nasi goreng mawut', 11500, 15000, '/assets/mawut.png'),
('Nasi goreng jawa', 8000, 12000, '/assets/jawa.png'),
('Nasi goreng hongkong', 15000, 20000, '/assets/hongkong.png');

INSERT INTO transactions (product_id, title, category, amount, type, quantity, transaction_date) VALUES
(1, 'Penjualan nasi goreng seafood', 'Penjualan', 100000, 'income', 4, CURDATE()),
(4, 'Penjualan nasi goreng hongkong', 'Penjualan', 60000, 'income', 3, CURDATE()),
(NULL, 'Kantong plastik', 'Operasional', 12000, 'expense', NULL, CURDATE()),
(NULL, 'Kertas nasi', 'Operasional', 20000, 'expense', NULL, CURDATE());
