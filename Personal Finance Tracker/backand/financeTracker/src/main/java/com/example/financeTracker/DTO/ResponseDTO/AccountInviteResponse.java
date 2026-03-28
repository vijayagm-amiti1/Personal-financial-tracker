package com.example.financeTracker.DTO.ResponseDTO;

import com.example.financeTracker.Entity.AccountInviteStatus;
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
public class AccountInviteResponse {

    private UUID id;
    private UUID accountId;
    private String accountName;
    private String accountType;
    private String institutionName;
    private String recipientEmail;
    private AccountMemberRole role;
    private AccountInviteStatus status;
    private String invitedByDisplayName;
    private String invitedByEmail;
    private String inviteLink;
    private LocalDateTime expiresAt;
    private LocalDateTime respondedAt;
    private LocalDateTime createdAt;
}
