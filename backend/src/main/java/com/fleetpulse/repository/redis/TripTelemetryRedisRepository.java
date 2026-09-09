package com.fleetpulse.repository.redis;

import com.fleetpulse.domain.TripTelemetryCache;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TripTelemetryRedisRepository extends CrudRepository<TripTelemetryCache, Long> {
}