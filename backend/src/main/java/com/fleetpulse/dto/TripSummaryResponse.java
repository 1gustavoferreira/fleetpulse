package com.fleetpulse.dto;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;

public record TripSummaryResponse(
        Long tripId,
        String containerNumber,
        String tripStatus,
        OffsetDateTime startedAt,
        OffsetDateTime finishedAt,
        Long durationMinutes,
        int totalTelemetryPoints,
        BigDecimal totalDistanceKm,
        BigDecimal averageSpeedKmH,
        BigDecimal maxSpeedKmH
) {}