-- Senha padrao '123456' em BCrypt: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi

-- Garante usuarios para os 3 motoristas
INSERT INTO users (name, email, password_hash, role, active)
VALUES 
  ('Carlos Eduardo Silva', 'carlos@fleetpulse.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ROLE_DRIVER', true),
  ('Marcos Silveira', 'marcos@fleetpulse.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ROLE_DRIVER', true),
  ('Roberto Santana', 'roberto@fleetpulse.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ROLE_DRIVER', true)
ON CONFLICT (email) DO NOTHING;

-- Garante motoristas 2 e 3
INSERT INTO drivers (id, name, cpf, cnh_number, phone, safety_score)
VALUES 
  (2, 'Marcos Silveira', '234.567.890-11', '23456789011', '(41) 98888-7777', 95),
  (3, 'Roberto Santana', '345.678.901-22', '34567890122', '(41) 97777-6666', 92)
ON CONFLICT (id) DO NOTHING;

-- Garante caminhoes 2 e 3
INSERT INTO trucks (plate, model, vin_number, fuel_capacity_liters, status, driver_id)
VALUES 
  ('BRA-2E19', 'Volvo FH 540 6x4', '9BWZZZ377VT004219', 500.00, 'IDLE', 2),
  ('PR-8840', 'Actros 2651 6x4', '9BWZZZ377VT004220', 480.00, 'IDLE', 3)
ON CONFLICT (plate) DO NOTHING;