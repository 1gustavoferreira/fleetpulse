package com.fleetpulse.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.data.Offset.offset;

class GeoUtilsTest {

    @Test
    @DisplayName("Deve calcular corretamente a distância entre Paranaguá e Curitiba (~70 a 75 km em linha reta)")
    void shouldCalculateAccurateDistanceBetweenPorts() {
        // Porto de Paranaguá
        BigDecimal lat1 = new BigDecimal("-25.5026");
        BigDecimal lon1 = new BigDecimal("-48.5100");

        // Curitiba
        BigDecimal lat2 = new BigDecimal("-25.4284");
        BigDecimal lon2 = new BigDecimal("-49.2733");

        double distance = GeoUtils.haversineDistanceKm(lat1, lon1, lat2, lon2);

        // Distância geodésica real é de aproximadamente 77 km
        assertThat(distance).isCloseTo(77.0, offset(2.0));
    }

    @Test
    @DisplayName("Deve retornar 0 para coordenadas idênticas")
    void shouldReturnZeroForSamePoint() {
        BigDecimal lat = new BigDecimal("-25.5026");
        BigDecimal lon = new BigDecimal("-48.5100");

        double distance = GeoUtils.haversineDistanceKm(lat, lon, lat, lon);

        assertThat(distance).isEqualTo(0.0);
    }
}