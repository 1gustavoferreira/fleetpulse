package com.fleetpulse.repository;

import com.fleetpulse.domain.ContainerTrip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ContainerTripRepository extends JpaRepository<ContainerTrip, Long> {
    List<ContainerTrip> findByTripStatus(String tripStatus);
    List<ContainerTrip> findByTruckId(Long truckId);

    @Query("SELECT t FROM ContainerTrip t WHERE t.driverId = :driverId AND t.tripStatus IN :statuses")
    List<ContainerTrip> findByDriverIdAndTripStatusIn(@Param("driverId") Long driverId, @Param("statuses") Collection<String> statuses);
}