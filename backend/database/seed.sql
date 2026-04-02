-- ============================================
-- DATOS INICIALES - SEED DATA
-- ============================================

-- Roles del sistema
INSERT INTO roles (name, permissions) VALUES
('admin', '{"all": true}'),
('gerente', '{"products": true, "sales": true, "inventory": true, "customers": true, "reports": true, "providers": true, "cash_register": true}'),
('vendedor', '{"sales": true, "products_read": true, "inventory_read": true, "customers": true, "cash_register": true}')
ON CONFLICT (name) DO NOTHING;

-- Usuario administrador por defecto (contraseña: admin123)
-- El hash se genera con bcryptjs, 10 rounds
INSERT INTO users (username, email, password_hash, first_name, last_name, role_id)
VALUES ('admin', 'admin@zuleykas.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Sistema', 1)
ON CONFLICT (username) DO NOTHING;

-- Configuración de precios por defecto
-- Córdobas nicaragüenses como moneda principal
INSERT INTO price_configs (name, tax_rate, currency, exchange_rate, is_default) VALUES
('IVA Nicaragua - Córdobas', 15.00, 'NIO', 1.0000, TRUE),
('IVA Nicaragua - Dólares', 15.00, 'USD', 36.7500, FALSE)
ON CONFLICT DO NOTHING;

-- Categorías de ejemplo para productos de ropa
-- (Las categorías se manejan como varchar en la tabla products)
