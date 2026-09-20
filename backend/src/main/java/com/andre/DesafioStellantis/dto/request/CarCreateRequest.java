package com.andre.DesafioStellantis.dto.request;

import com.andre.DesafioStellantis.enums.FuelType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record CarCreateRequest(
        @NotBlank
        String mark,
        @NotBlank
        String model,
        @NotBlank
        String chassis,
        @NotNull
        Integer year,
        @NotNull
        BigDecimal price,
        @NotNull
        List<FuelType> fuelsTypes,
        @NotBlank
        String color,
        @NotBlank
        String externalColor,
        @NotNull
        Long dealershipId
) {
}
