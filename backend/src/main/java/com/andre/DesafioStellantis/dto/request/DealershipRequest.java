package com.andre.DesafioStellantis.dto.request;

import com.andre.DesafioStellantis.domain.Address;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DealershipRequest(
        @NotBlank
        String name,
        @NotBlank
        @Size(min = 14)
        String cnpj,
        Address address
) {
}
