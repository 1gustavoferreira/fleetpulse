package com.fleetpulse.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "container_trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContainerTrip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "container_number", nullable = false, length = 20)
    private String containerNumber;

    @Column(name = "seal_number", nullable = false, length = 30)
    private String sealNumber;

    @Column(name = "container_type", nullable = false, length = 20)
    private String containerType; // DRY_20, DRY_40, REEFER_40

    @Column(name = "gross_weight_kg", nullable = false)
    private BigDecimal grossWeightKg;

    @Column(name = "origin_location", nullable = false)
    private String originLocation;

    @Column(name = "destination_location", nullable = false)
    private String destinationLocation;

    @Column(name = "trip_status", nullable = false, length = 30)
    private String tripStatus;

    @Column(name = "truck_id", nullable = false)
    private Long truckId;

    @Column(name = "driver_id", nullable = false)
    private Long driverId;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "finished_at")
    private OffsetDateTime finishedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        if (this.tripStatus == null) {
            this.tripStatus = "SCHEDULED";
        }
    }
}