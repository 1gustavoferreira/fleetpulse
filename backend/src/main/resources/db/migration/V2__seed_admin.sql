-- Usuário inicial: admin@fleetpulse.com / senha: admin123
INSERT INTO users (name, email, password_hash, role, active)
VALUES (
    'Administrador Geral',
    'admin@fleetpulse.com',
    '$2a$10$wL4zWJg4kRkG8N7bXmPFOe4pS/bCkmV8zE8eR7lMhV.3XwG3p.yKy',
    'ROLE_ADMIN',
    true
);

-- Motorista e Cavalo Mecânico de Demonstração
INSERT INTO drivers (name, cpf, cnh_number, phone, safety_score)
VALUES ('Carlos Eduardo Silva', '123.456.789-00', '12345678900', '(41) 99999-8888', 98);

INSERT INTO trucks (plate, model, vin_number, fuel_capacity_liters, status, driver_id)
VALUES ('ABC-4E26', 'Volvo FH 540 6x4', '9BWZZZ377VT004218', 450.00, 'IDLE', 1);