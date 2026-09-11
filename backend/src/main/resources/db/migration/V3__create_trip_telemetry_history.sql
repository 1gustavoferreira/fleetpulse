CREATE TABLE IF NOT EXISTS trip_telemetry_history (
    id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed_kmh DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_telemetry_trip FOREIGN KEY (trip_id) REFERENCES container_trips(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_telemetry_trip_id ON trip_telemetry_history(trip_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_recorded_at ON trip_telemetry_history(recorded_at);