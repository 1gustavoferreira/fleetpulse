package com.fleetpulse.repository;
import java.util.Map;
import com.fleetpulse.domain.ContainerTrip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContainerTripRepository extends JpaRepository<ContainerTrip, Long> {
    List<ContainerTrip> findByTripStatus(String tripStatus);
    List<ContainerTrip> findByTruckId(Long truckId);
}