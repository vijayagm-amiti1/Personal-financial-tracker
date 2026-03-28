package com.example.financeTracker.DTO.RequestDTO;

import com.example.financeTracker.Entity.AccountMemberRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountMemberRoleUpdateRequest {

    @NotNull(message = "role is required")
    private AccountMemberRole role;
}
