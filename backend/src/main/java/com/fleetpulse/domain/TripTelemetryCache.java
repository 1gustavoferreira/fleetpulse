package com.fleetpulse.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

import java.io.Serializable;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("TripTelemetry")
public class TripTelemetryCache implements Serializable {

    @Id
    private Long tripId;
    private Double latitude;
    private Double longitude;
    private Double speedKmH;
    private Instant recordedAt;

    @TimeToLive
    @Builder.Default
    private Long ttlSeconds = 86400L;
}