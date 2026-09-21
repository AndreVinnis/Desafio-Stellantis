package com.andre.DesafioStellantis.dto.response;

import com.andre.DesafioStellantis.enums.UserRole;

public record UserResponse(
        Long id,
        String name,
        String email,
        String position,
        UserRole role
) {
}
