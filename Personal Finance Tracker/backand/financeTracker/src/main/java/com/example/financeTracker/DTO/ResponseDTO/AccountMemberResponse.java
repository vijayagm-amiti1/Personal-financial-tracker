package com.example.financeTracker.DTO.ResponseDTO;

import com.example.financeTracker.Entity.AccountMemberRole;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountMemberResponse {

    private UUID id;
    private UUID userId;
    private String email;
    private String displayName;
    private AccountMemberRole role;
    private boolean owner;
    private LocalDateTime createdAt;
}
