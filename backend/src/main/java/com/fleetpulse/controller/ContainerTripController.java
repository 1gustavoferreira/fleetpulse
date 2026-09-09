package com.fleetpulse.controller;

import com.fleetpulse.domain.ContainerTrip;
import com.fleetpulse.domain.TripTelemetryCache;
import com.fleetpulse.dto.TripTelemetryRequest;
import com.fleetpulse.repository.ContainerTripRepository;
import com.fleetpulse.repository.redis.TripTelemetryRedisRepository;
import com.fleetpulse.validation.Iso6346Validator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@Tag(name = "Operações de Contêineres", description = "Gestão de viagens, lacres e rotas portuárias")
public class ContainerTripController {

    private final ContainerTripRepository tripRepository;
    private final TripTelemetryRedisRepository telemetryRedisRepository;

    @GetMapping
    @Operation(summary = "Listar todas as viagens registradas")
    public ResponseEntity<List<ContainerTrip>> getAllTrips() {
        return ResponseEntity.ok(tripRepository.findAll());
    }

    @PostMapping
    @Operation(summary = "Criar nova ordem de transporte de contêiner")
    public ResponseEntity<?> createTrip(@Valid @RequestBody CreateTripRequest request) {
        String container = request.containerNumber() != null ? request.containerNumber().toUpperCase().trim() : "";

        if (!Iso6346Validator.isValid(container)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of(
                    "status", 400,
                    "error", "Bad Request",
                    "message", "O código do contêiner informado (" + container + ") é inválido conforme a norma ISO 6346."
                )
            );
        }

        ContainerTrip trip = ContainerTrip.builder()
                .containerNumber(container)
                .sealNumber(request.sealNumber().trim())
                .containerType(request.containerType().toUpperCase().trim())
                .grossWeightKg(request.grossWeightKg())
                .originLocation(request.originLocation())
                .destinationLocation(request.destinationLocation())
                .truckId(request.truckId())
                .driverId(request.driverId())
                .tripStatus("SCHEDULED")
                .build();

        return ResponseEntity.ok(tripRepository.save(trip));
    }

    @PatchMapping("/{id}/start")
    @Operation(summary = "Iniciar viagem (Caminhão em trânsito)")
    public ResponseEntity<?> startTrip(@PathVariable Long id) {
        return tripRepository.findById(id).map(trip -> {
            if (!"SCHEDULED".equals(trip.getTripStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", "Apenas viagens com status SCHEDULED podem ser iniciadas.")
                );
            }
            trip.setTripStatus("IN_TRANSIT");
            trip.setStartedAt(OffsetDateTime.now());
            return ResponseEntity.ok((Object) tripRepository.save(trip));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Finalizar viagem (Entrega concluída no destino)")
    public ResponseEntity<?> completeTrip(@PathVariable Long id) {
        return tripRepository.findById(id).map(trip -> {
            if (!"IN_TRANSIT".equals(trip.getTripStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", "Apenas viagens em trânsito (IN_TRANSIT) podem ser finalizadas.")
                );
            }
            trip.setTripStatus("DELIVERED");
            trip.setFinishedAt(OffsetDateTime.now());
            return ResponseEntity.ok((Object) tripRepository.save(trip));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/telemetry")
    @Operation(summary = "Registrar check-in de GPS da carga em tempo real no cache Redis")
    public ResponseEntity<?> recordTelemetry(@PathVariable Long id, @Valid @RequestBody TripTelemetryRequest request) {
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
            return ResponseEntity.ok(cache);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/telemetry/latest")
    @Operation(summary = "Obter a última localização conhecida do contêiner a partir do cache Redis")
    public ResponseEntity<?> getLatestTelemetry(@PathVariable Long id) {
        return telemetryRedisRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
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
}