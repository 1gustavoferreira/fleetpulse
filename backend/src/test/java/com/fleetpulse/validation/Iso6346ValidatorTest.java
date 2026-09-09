package com.fleetpulse.validation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class Iso6346ValidatorTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "CSQU3054383",
            "TGHU1234567",
            "MSKU0123459"
    })
    @DisplayName("Deve validar com sucesso contêineres com dígito verificador correto")
    void shouldValidateCorrectContainerNumbers(String containerNumber) {
        assertTrue(Iso6346Validator.isValid(containerNumber));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "CSQU3054389", // Dígito incorreto
            "MSCU7829104", // Dígito incorreto
            "INVALID1234", // Letras no número
            "CSQU305438",  // Menos de 11 caracteres
            "CSQU30543833",// Mais de 11 caracteres
            "",            // Vazio
            "   "          // Espaços em branco
    })
    @DisplayName("Deve rejeitar contêineres com formatação ou dígito inválido")
    void shouldRejectInvalidContainerNumbers(String containerNumber) {
        assertFalse(Iso6346Validator.isValid(containerNumber));
    }

    @Test
    @DisplayName("Deve rejeitar valor nulo")
    void shouldRejectNullContainerNumber() {
        assertFalse(Iso6346Validator.isValid(null));
    }
}