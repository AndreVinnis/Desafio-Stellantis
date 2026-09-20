package com.andre.DesafioStellantis.dto.response;

import java.math.BigDecimal;

public record CarResponse(
        Long id,
        String mark,
        String model,
        Integer year,
        BigDecimal price,
        String externalColor
) {
}
