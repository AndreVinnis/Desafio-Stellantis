package com.andre.DesafioStellantis.dto.response;

import java.math.BigDecimal;

public record CarResponse(
        String mark,
        String model,
        Integer year,
        BigDecimal price,
        String externalColor
) {
}
