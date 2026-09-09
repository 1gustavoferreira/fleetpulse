package com.fleetpulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CreateTripRequest(
    @NotBlank String containerNumber,
    @NotBlank String sealNumber,
    @NotBlank String containerType, // DRY_20, DRY_40, REEFER_40
    @NotNull @Positive BigDecimal grossWeightKg,
    @NotBlank String originLocation,
    @NotBlank String destinationLocation,
    @NotNull Long truckId,
    @NotNull Long driverId
) {}