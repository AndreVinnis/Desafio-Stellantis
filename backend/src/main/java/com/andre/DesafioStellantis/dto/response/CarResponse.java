package com.andre.DesafioStellantis.dto.response;

import com.andre.DesafioStellantis.enums.FuelType;
import java.math.BigDecimal;
import java.util.List;

public record CarResponse(
        Long id,
        String mark,
        String model,
        String chassis,
        Integer year,
        BigDecimal price,
        String color,
        String externalColor,
        List<FuelType> fuelsTypes,
        Long dealershipId,
        String dealershipName
) {
}
