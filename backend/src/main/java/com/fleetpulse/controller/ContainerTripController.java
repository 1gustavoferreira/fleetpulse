package com.fleetpulse.controller;

import com.fleetpulse.domain.ContainerTrip;
import com.fleetpulse.dto.CreateTripRequest;
import com.fleetpulse.repository.ContainerTripRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fleetpulse.validation.Iso6346Validator;
import org.springframework.http.HttpStatus;
import java.util.Map;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@Tag(name = "Operações de Contêineres", description = "Gestão de viagens, lacres e rotas portuárias")
public class ContainerTripController {

    private final ContainerTripRepository tripRepository;

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

    @GetMapping
    @Operation(summary = "Listar todas as viagens registradas")
    public ResponseEntity<List<ContainerTrip>> listAllTrips() {
        return ResponseEntity.ok(tripRepository.findAll());
    }

    @PatchMapping("/{id}/start")
    @Operation(summary = "Iniciar viagem (Caminhão em trânsito)")
    public ResponseEntity<ContainerTrip> startTrip(@PathVariable Long id) {
        ContainerTrip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Viagem não encontrada"));

        trip.setTripStatus("IN_TRANSIT");
        trip.setStartedAt(OffsetDateTime.now());
        return ResponseEntity.ok(tripRepository.save(trip));
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Finalizar viagem (Entrega concluída no destino)")
    public ResponseEntity<ContainerTrip> completeTrip(@PathVariable Long id) {
        ContainerTrip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Viagem não encontrada"));

        trip.setTripStatus("DELIVERED");
        trip.setFinishedAt(OffsetDateTime.now());
        return ResponseEntity.ok(tripRepository.save(trip));
    }
}