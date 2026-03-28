package com.example.financeTracker.DTO.RequestDTO;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountInviteResponseRequest {

    @NotNull(message = "accepted is required")
    private Boolean accepted;
}
