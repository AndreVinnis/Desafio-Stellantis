package com.andre.DesafioStellantis.dto.response;

import com.andre.DesafioStellantis.domain.Address;
import java.util.List;

public record DealershipResponse(
        Long id,
        String name,
        String cnpj,
        Address address,
        List<CarResponse> cars
) {
}
