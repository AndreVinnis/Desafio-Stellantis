package com.andre.DesafioStellantis.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(

        @NotBlank
        String name,
        @NotBlank
        String email,
        @NotBlank
        @Size(min = 8)
        String password,
        @NotBlank
        String position
) {
}
