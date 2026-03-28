package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.RequestDTO.AccountInviteRequest;
import com.example.financeTracker.DTO.RequestDTO.AccountMemberRoleUpdateRequest;
import com.example.financeTracker.DTO.ResponseDTO.AccountInviteResponse;
import com.example.financeTracker.DTO.ResponseDTO.AccountMemberResponse;
import com.example.financeTracker.Entity.Account;
import com.example.financeTracker.Entity.AccountMemberRole;
import java.util.List;
import java.util.UUID;

public interface AccountSharingService {

    List<AccountMemberResponse> getMembers(UUID accountId, UUID userId);

    AccountInviteResponse inviteMember(UUID accountId, AccountInviteRequest request, UUID userId);

    AccountMemberResponse updateMemberRole(UUID accountId, UUID memberUserId, AccountMemberRoleUpdateRequest request, UUID userId);

    void removeMember(UUID accountId, UUID memberUserId, UUID userId);

    AccountInviteResponse getInviteByToken(String token);

    AccountInviteResponse respondToInvite(String token, UUID userId, boolean accepted);

    Account requireAccessibleAccount(UUID accountId, UUID userId);

    Account requireOwnerAccount(UUID accountId, UUID userId);

    AccountMemberRole getRoleForAccount(UUID accountId, UUID userId);
}
