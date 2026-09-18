package com.andre.DesafioStellantis.dto.request;

import com.andre.DesafioStellantis.enums.FuelType;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.List;

public record CarCreateRequest(
        @NotBlank
        String mark,
        @NotBlank
        String model,
        @NotBlank
        String chassis,
        Integer year,
        BigDecimal price,
        List<FuelType> fuelsTypes,
        @NotBlank
        String color,
        @NotBlank
        String externalColor,
        Long dealershipId
) {
}
