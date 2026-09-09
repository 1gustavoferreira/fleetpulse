package com.fleetpulse.repository;

import com.fleetpulse.domain.TripDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripDocumentRepository extends JpaRepository<TripDocument, Long> {
    List<TripDocument> findByTripId(Long tripId);
}