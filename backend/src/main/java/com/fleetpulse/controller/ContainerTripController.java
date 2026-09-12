package com.fleetpulse.controller;

import com.fleetpulse.domain.ContainerTrip;
import com.fleetpulse.domain.TripTelemetryCache;
import com.fleetpulse.dto.TripSummaryResponse;
import com.fleetpulse.dto.TripTelemetryRequest;
import com.fleetpulse.entity.TripTelemetryHistory;
import com.fleetpulse.repository.ContainerTripRepository;
import com.fleetpulse.repository.TripTelemetryHistoryRepository;
import com.fleetpulse.repository.redis.TripTelemetryRedisRepository;
import com.fleetpulse.util.GeoUtils;
import com.fleetpulse.validation.Iso6346Validator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@Tag(name = "OperaÃƒÂ§ÃƒÂµes de ContÃƒÂªineres", description = "GestÃƒÂ£o de viagens, lacres e rotas portuÃƒÂ¡rias")
public class ContainerTripController {

    private final ContainerTripRepository tripRepository;
    private final TripTelemetryRedisRepository telemetryRedisRepository;
    private final TripTelemetryHistoryRepository telemetryHistoryRepository;

    @GetMapping
    @Operation(summary = "Listar todas as viagens registradas")
    public ResponseEntity<List<ContainerTrip>> getAllTrips() {
        return ResponseEntity.ok(tripRepository.findAll());
    }

    @GetMapping("/driver/{driverId}/active")
    @Operation(summary = "Listar viagens ativas atribuÃƒÂ­das ao motorista (SCHEDULED ou IN_TRANSIT)")
    public ResponseEntity<List<ContainerTrip>> getActiveTripsForDriver(@PathVariable Long driverId) {
        List<ContainerTrip> activeTrips = tripRepository.findByDriverIdAndTripStatusIn(
                driverId,
                List.of("SCHEDULED", "IN_TRANSIT")
        );
        return ResponseEntity.ok(activeTrips);
    }

    @PostMapping
    @Operation(summary = "Criar nova ordem de transporte de contÃƒÂªiner")
    public ResponseEntity<ContainerTrip> createTrip(@Valid @RequestBody CreateTripRequest request) {
        if (!Iso6346Validator.isValid(request.containerNumber())) {
            return ResponseEntity.badRequest().build();
        }

        ContainerTrip trip = ContainerTrip.builder()
                .containerNumber(request.containerNumber())
                .sealNumber(request.sealNumber())
                .containerType(request.containerType())
                .grossWeightKg(request.grossWeightKg())
                .originLocation(request.originLocation())
                .destinationLocation(request.destinationLocation())
                .truckId(request.truckId() != null ? request.truckId() : 1L)
                .driverId(request.driverId() != null ? request.driverId() : 1L)
                .tripStatus("SCHEDULED")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(tripRepository.save(trip));
    }

    @PatchMapping("/{id}/start")
    @Operation(summary = "Iniciar viagem (CaminhÃƒÂ£o em trÃƒÂ¢nsito)")
    public ResponseEntity<ContainerTrip> startTrip(@PathVariable Long id) {
        return tripRepository.findById(id).map(trip -> {
            trip.setTripStatus("IN_TRANSIT");
            trip.setStartedAt(OffsetDateTime.now());
            return ResponseEntity.ok(tripRepository.save(trip));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Finalizar viagem (Entrega concluÃƒÂ­da no destino)")
    public ResponseEntity<ContainerTrip> completeTrip(@PathVariable Long id) {
        return tripRepository.findById(id).map(trip -> {
            if (!"IN_TRANSIT".equalsIgnoreCase(trip.getTripStatus())) {
                return ResponseEntity.badRequest().<ContainerTrip>build();
            }

            trip.setTripStatus("DELIVERED");
            trip.setFinishedAt(OffsetDateTime.now());
            telemetryRedisRepository.deleteById(id);
            return ResponseEntity.ok(tripRepository.save(trip));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/telemetry")
    @Operation(summary = "Registrar check-in de GPS da carga em tempo real no cache Redis e histÃƒÂ³rico PostgreSQL")
    public ResponseEntity<TripTelemetryCache> recordTelemetry(@PathVariable Long id, @Valid @RequestBody TripTelemetryRequest request) {
        return tripRepository.findById(id).map(trip -> {
            Instant recordedAt = (request.timestamp() != null) ? request.timestamp() : Instant.now();

            TripTelemetryCache cache = TripTelemetryCache.builder()
                    .tripId(id)
                    .latitude(request.latitude())
                    .longitude(request.longitude())
                    .speedKmH(request.speedKmH())
                    .recordedAt(recordedAt)
                    .build();
            telemetryRedisRepository.save(cache);

            TripTelemetryHistory history = TripTelemetryHistory.builder()
                    .tripId(id)
                    .latitude(request.latitude())
                    .longitude(request.longitude())
                    .speedKmH(request.speedKmH())
                    .recordedAt(recordedAt)
                    .build();
            telemetryHistoryRepository.save(history);

            return ResponseEntity.ok(cache);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/telemetry/latest")
    @Operation(summary = "Obter a ÃƒÂºltima localizaÃƒÂ§ÃƒÂ£o conhecida do contÃƒÂªiner a partir do cache Redis")
    public ResponseEntity<TripTelemetryCache> getLatestTelemetry(@PathVariable Long id) {
        return telemetryRedisRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/telemetry/history")
    @Operation(summary = "Obter o histÃƒÂ³rico completo de rastreamento auditÃƒÂ¡vel no PostgreSQL")
    public ResponseEntity<List<TripTelemetryHistory>> getTripHistory(@PathVariable Long id) {
        return ResponseEntity.ok(telemetryHistoryRepository.findByTripIdOrderByRecordedAtAsc(id));
    }

    @GetMapping("/{id}/summary")
    @Operation(summary = "Obter relatÃƒÂ³rio consolidado da viagem com mÃƒÂ©tricas de trajeto via Haversine",
               responses = {
                   @ApiResponse(responseCode = "200", description = "Resumo consolidado com sucesso",
                                content = @Content(schema = @Schema(implementation = TripSummaryResponse.class))),
                   @ApiResponse(responseCode = "404", description = "Viagem nÃƒÂ£o encontrada")
               })
    public ResponseEntity<TripSummaryResponse> getTripSummary(@PathVariable Long id) {
        return tripRepository.findById(id).map(trip -> {
            List<TripTelemetryHistory> history = telemetryHistoryRepository.findByTripIdOrderByRecordedAtAsc(id);

            if (history.isEmpty()) {
                return ResponseEntity.ok(new TripSummaryResponse(
                        trip.getId(),
                        trip.getContainerNumber(),
                        trip.getTripStatus(),
                        trip.getStartedAt(),
                        trip.getFinishedAt(),
                        0L,
                        0,
                        BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                        BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                        BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                ));
            }

            double totalDistance = 0.0;
            double totalSpeed = 0.0;
            double maxSpeed = 0.0;

            for (int i = 0; i < history.size(); i++) {
                TripTelemetryHistory current = history.get(i);

                if (current.getSpeedKmH() != null) {
                    double speed = current.getSpeedKmH().doubleValue();
                    totalSpeed += speed;
                    if (speed > maxSpeed) {
                        maxSpeed = speed;
                    }
                }

                if (i > 0) {
                    TripTelemetryHistory previous = history.get(i - 1);
                    totalDistance += GeoUtils.haversineDistanceKm(
                            previous.getLatitude(),
                            previous.getLongitude(),
                            current.getLatitude(),
                            current.getLongitude()
                    );
                }
            }

            double avgSpeed = totalSpeed / history.size();

            Long durationMinutes = 0L;
            if (trip.getStartedAt() != null) {
                OffsetDateTime endTime = trip.getFinishedAt() != null ? trip.getFinishedAt() : OffsetDateTime.now();
                durationMinutes = Duration.between(trip.getStartedAt(), endTime).toMinutes();
            }

            TripSummaryResponse response = new TripSummaryResponse(
                    trip.getId(),
                    trip.getContainerNumber(),
                    trip.getTripStatus(),
                    trip.getStartedAt(),
                    trip.getFinishedAt(),
                    durationMinutes,
                    history.size(),
                    BigDecimal.valueOf(totalDistance).setScale(2, RoundingMode.HALF_UP),
                    BigDecimal.valueOf(avgSpeed).setScale(2, RoundingMode.HALF_UP),
                    BigDecimal.valueOf(maxSpeed).setScale(2, RoundingMode.HALF_UP)
            );

            return ResponseEntity.ok(response);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record CreateTripRequest(
            String containerNumber,
            String sealNumber,
            String containerType,
            BigDecimal grossWeightKg,
            String originLocation,
            String destinationLocation,
            Long truckId,
            Long driverId
    ) {}

    @GetMapping("/history")
    public org.springframework.http.ResponseEntity<java.util.List<com.fleetpulse.domain.ContainerTrip>> getCompletedTrips() {
        java.util.List<com.fleetpulse.domain.ContainerTrip> list = tripRepository.findAll().stream()
                .filter(t -> "DELIVERED".equalsIgnoreCase(String.valueOf(t.getTripStatus())))
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .toList();
        return org.springframework.http.ResponseEntity.ok(list);
    }

    @PutMapping("/{id}")
    public org.springframework.http.ResponseEntity<com.fleetpulse.domain.ContainerTrip> updateTrip(
            @PathVariable Long id,
            @RequestBody com.fleetpulse.dto.CreateTripRequest request) {
        com.fleetpulse.domain.ContainerTrip trip = tripRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Trip not found"));

        if (!"SCHEDULED".equalsIgnoreCase(String.valueOf(trip.getTripStatus()))) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Somente viagens aguardando início podem ser alteradas");
        }

        if (!com.fleetpulse.validation.Iso6346Validator.isValid(request.containerNumber())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Contêiner ISO 6346 inválido");
        }

        trip.setContainerNumber(request.containerNumber());
        trip.setSealNumber(request.sealNumber());
        trip.setOriginLocation(request.originLocation());
        trip.setDestinationLocation(request.destinationLocation());
        if (request.driverId() != null) trip.setDriverId(request.driverId());
        if (request.truckId() != null) trip.setTruckId(request.truckId());

        return org.springframework.http.ResponseEntity.ok(tripRepository.save(trip));
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<Void> deleteTrip(@PathVariable Long id) {
        com.fleetpulse.domain.ContainerTrip trip = tripRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Trip not found"));

        if ("IN_TRANSIT".equalsIgnoreCase(String.valueOf(trip.getTripStatus()))) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Cargas em trânsito não podem ser excluídas diretamente");
        }

        tripRepository.delete(trip);
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}