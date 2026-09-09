-- 1. Controle de Usuários e Acesso (RBAC)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL, -- ROLE_ADMIN, ROLE_DISPATCHER, ROLE_OPERATOR
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Motoristas
CREATE TABLE drivers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    cnh_number VARCHAR(20) NOT NULL UNIQUE,
    phone VARCHAR(20),
    safety_score INT DEFAULT 100 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Caminhões / Cavalos Mecânicos
CREATE TABLE trucks (
    id BIGSERIAL PRIMARY KEY,
    plate VARCHAR(10) NOT NULL UNIQUE,
    model VARCHAR(60) NOT NULL,
    vin_number VARCHAR(17) UNIQUE,
    fuel_capacity_liters NUMERIC(6,2) NOT NULL DEFAULT 400.00,
    status VARCHAR(30) DEFAULT 'IDLE' NOT NULL, -- IDLE, IN_TRANSIT, LOADING, MAINTENANCE
    driver_id BIGINT REFERENCES drivers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Viagens de Contêiner (Porto / Retroporto)
CREATE TABLE container_trips (
    id BIGSERIAL PRIMARY KEY,
    container_number VARCHAR(20) NOT NULL, -- Padrão ISO (Ex: MSKU923841-2)
    seal_number VARCHAR(30) NOT NULL,      -- Número do Lacre
    container_type VARCHAR(20) NOT NULL,   -- DRY_20, DRY_40, REEFER_40
    gross_weight_kg NUMERIC(10,2) NOT NULL,
    origin_location VARCHAR(120) NOT NULL,
    destination_location VARCHAR(120) NOT NULL,
    trip_status VARCHAR(30) DEFAULT 'SCHEDULED' NOT NULL, -- SCHEDULED, EN_ROUTE, DELIVERED, CANCELLED
    truck_id BIGINT REFERENCES trucks(id) NOT NULL,
    driver_id BIGINT REFERENCES drivers(id) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Cofre de Documentos Fiscais (PDFs: CT-e, MDF-e, Booking, Ticket de Pesagem)
CREATE TABLE trip_documents (
    id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT REFERENCES container_trips(id) ON DELETE CASCADE NOT NULL,
    doc_type VARCHAR(40) NOT NULL, -- CTE, NFE, PORT_BOOKING, WEIGH_TICKET
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    uploaded_by_user_id BIGINT REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Telemetria Contínua (Série Temporal)
CREATE TABLE telemetry_logs (
    id BIGSERIAL PRIMARY KEY,
    truck_id BIGINT REFERENCES trucks(id) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    speed_kmh NUMERIC(5, 2) NOT NULL,
    rpm INT NOT NULL,
    coolant_temp_c NUMERIC(5, 2) NOT NULL,
    fuel_level_liters NUMERIC(6, 2) NOT NULL,
    fuel_level_pct NUMERIC(5, 2) NOT NULL,
    cargo_temp_c NUMERIC(5, 2), -- Telemetria de contêiner reefer (opcional)
    odometer_km NUMERIC(10, 2) NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Índices de Alta Performance para Telemetria
CREATE INDEX idx_telemetry_truck_logged ON telemetry_logs (truck_id, logged_at DESC);

-- 7. Alertas e Incidentes em Tempo Real
CREATE TABLE telemetry_alerts (
    id BIGSERIAL PRIMARY KEY,
    truck_id BIGINT REFERENCES trucks(id) NOT NULL,
    alert_type VARCHAR(40) NOT NULL, -- OVERSPEED, SUDDEN_FUEL_DROP, HIGH_TEMP, REEFER_TEMP_OUT_OF_RANGE
    severity VARCHAR(20) NOT NULL,   -- LOW, MEDIUM, HIGH, CRITICAL
    recorded_value VARCHAR(50) NOT NULL,
    description TEXT,
    resolved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. Trilha de Auditoria (LGPD & Compliance)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(60) NOT NULL,     -- DOWNLOAD_DOCUMENT, UPDATE_DRIVER, FORCE_ALARM_DISMISS
    resource_accessed VARCHAR(120) NOT NULL,
    ip_address VARCHAR(45),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);