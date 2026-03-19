package com.example.financeTracker.DTO.ResponseDTO;

import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String email,
        String displayName
) {
}
