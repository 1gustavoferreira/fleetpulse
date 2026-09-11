package com.fleetpulse.repository;

import com.fleetpulse.entity.TripTelemetryHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TripTelemetryHistoryRepository extends JpaRepository<TripTelemetryHistory, Long> {
    
    // Busca todo o histórico de pontos de uma viagem ordenado cronologicamente
    List<TripTelemetryHistory> findByTripIdOrderByRecordedAtAsc(Long tripId);
}