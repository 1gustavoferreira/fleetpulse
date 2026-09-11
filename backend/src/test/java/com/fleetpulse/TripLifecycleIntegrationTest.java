package com.fleetpulse;

import com.fleetpulse.config.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import static org.assertj.core.api.Assertions.assertThat;

class TripLifecycleIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JwtService jwtService;

    @Test
    @DisplayName("Deve rejeitar container com ISO 6346 inválido com 400 Bad Request")
    void shouldRejectInvalidIsoContainer() {
        String body = """
            {
              "containerNumber": "MSKU1234567",
              "sealNumber": "SEAL-01",
              "containerType": "DRY_40",
              "grossWeightKg": 20000.0,
              "originLocation": "Paranagua",
              "destinationLocation": "Curitiba",
              "truckId": 1,
              "driverId": 1
            }
        """;

        HttpHeaders headers = getAuthHeaders();
        HttpEntity<String> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity("/api/v1/trips", request, String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("ISO 6346");
    }

    private HttpHeaders getAuthHeaders() {
        // Usa a assinatura real do JwtService: generateToken(String username, String role)
        String token = jwtService.generateToken("admin@fleetpulse.com", "ROLE_ADMIN");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);
        return headers;
    }
}