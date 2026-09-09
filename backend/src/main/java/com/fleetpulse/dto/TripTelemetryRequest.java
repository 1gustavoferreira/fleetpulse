package com.fleetpulse.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record TripTelemetryRequest(
        @NotNull Double latitude,
        @NotNull Double longitude,
        Double speedKmH,
        Instant timestamp
) {}