package com.fleetpulse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "trip_telemetry_history", indexes = {
    @Index(name = "idx_telemetry_trip_id", columnList = "trip_id"),
    @Index(name = "idx_telemetry_recorded_at", columnList = "recorded_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripTelemetryHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trip_id", nullable = false)
    private Long tripId;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "speed_kmh", nullable = false)
    private Double speedKmH;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;
}