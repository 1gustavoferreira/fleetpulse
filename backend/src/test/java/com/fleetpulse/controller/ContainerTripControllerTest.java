package com.fleetpulse.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetpulse.domain.ContainerTrip;
import com.fleetpulse.repository.ContainerTripRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ContainerTripControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ContainerTripRepository tripRepository;

    @Test
    @DisplayName("Deve rejeitar requisição sem autenticação (401 ou 403)")
    void shouldRejectUnauthenticatedRequest() throws Exception {
        mockMvc.perform(get("/api/v1/trips"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@fleetpulse.com", roles = {"ADMIN"})
    @DisplayName("Deve criar viagem com contêiner válido pela ISO 6346")
    void shouldCreateTripWithValidContainer() throws Exception {
        Map<String, Object> request = Map.of(
                "containerNumber", "CSQU3054383",
                "sealNumber", "SEAL-TEST-1001",
                "containerType", "DRY_40",
                "grossWeightKg", new BigDecimal("25000.00"),
                "originLocation", "Porto de Paranaguá",
                "destinationLocation", "CD Curitiba",
                "truckId", 1L,
                "driverId", 1L
        );

        mockMvc.perform(post("/api/v1/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.containerNumber").value("CSQU3054383"))
                .andExpect(jsonPath("$.tripStatus").value("SCHEDULED"));
    }

    @Test
    @WithMockUser(username = "admin@fleetpulse.com", roles = {"ADMIN"})
    @DisplayName("Deve rejeitar criação de viagem com contêiner de dígito verificador inválido (400)")
    void shouldRejectTripWithInvalidContainer() throws Exception {
        Map<String, Object> request = Map.of(
                "containerNumber", "CSQU3054389",
                "sealNumber", "SEAL-TEST-1002",
                "containerType", "DRY_40",
                "grossWeightKg", new BigDecimal("25000.00"),
                "originLocation", "Porto de Paranaguá",
                "destinationLocation", "CD Curitiba",
                "truckId", 1L,
                "driverId", 1L
        );

        mockMvc.perform(post("/api/v1/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @WithMockUser(username = "admin@fleetpulse.com", roles = {"ADMIN"})
    @DisplayName("Deve impedir finalização direta de viagem em status SCHEDULED (400)")
    void shouldRejectCompletingScheduledTrip() throws Exception {
        ContainerTrip trip = tripRepository.save(ContainerTrip.builder()
                .containerNumber("TGHU1234567")
                .sealNumber("SEAL-TEST-999")
                .containerType("DRY_20")
                .grossWeightKg(new BigDecimal("18000.00"))
                .originLocation("Pátio Paranaguá")
                .destinationLocation("CD Curitiba")
                .truckId(1L)
                .driverId(1L)
                .tripStatus("SCHEDULED")
                .build());

        mockMvc.perform(patch("/api/v1/trips/" + trip.getId() + "/complete"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Apenas viagens em trânsito (IN_TRANSIT) podem ser finalizadas."));
    }
}