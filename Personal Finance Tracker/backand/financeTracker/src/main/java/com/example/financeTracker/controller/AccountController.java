package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.RequestDTO.AccountRequest;
import com.example.financeTracker.DTO.RequestDTO.AccountInviteRequest;
import com.example.financeTracker.DTO.RequestDTO.AccountMemberRoleUpdateRequest;
import com.example.financeTracker.DTO.ResponseDTO.AccountResponse;
import com.example.financeTracker.DTO.ResponseDTO.AccountInviteResponse;
import com.example.financeTracker.DTO.ResponseDTO.AccountMemberResponse;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.AccountService;
import com.example.financeTracker.Service.AccountSharingService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Slf4j
public class AccountController {

    private final AccountService accountService;
    private final AccountSharingService accountSharingService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAccounts(Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received get accounts request for user {}", userId);
        return ResponseEntity.ok(accountService.getAccountResponsesByUserId(userId));
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<AccountResponse> getAccount(@PathVariable UUID accountId,
                                                      Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received get account request for user {} and account {}", userId, accountId);
        return ResponseEntity.ok(accountService.getAccountResponseById(accountId, userId));
    }

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody AccountRequest request,
                                                         Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received create account request for user {}", userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.createAccount(request, userId));
    }

    @PutMapping("/{accountId}")
    public ResponseEntity<AccountResponse> updateAccount(@PathVariable UUID accountId,
                                                         @Valid @RequestBody AccountRequest request,
                                                         Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received update account request for user {} and account {}", userId, accountId);
        return ResponseEntity.ok(accountService.updateAccount(accountId, request, userId));
    }

    @DeleteMapping("/{accountId}")
    public ResponseEntity<Void> deactivateAccount(@PathVariable UUID accountId,
                                                  Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received deactivate account request for user {} and account {}", userId, accountId);
        accountService.deleteAccount(accountId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{accountId}/members")
    public ResponseEntity<List<AccountMemberResponse>> getMembers(@PathVariable UUID accountId,
                                                                 Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received get account members request for user {} and account {}", userId, accountId);
        return ResponseEntity.ok(accountSharingService.getMembers(accountId, userId));
    }

    @PostMapping("/{accountId}/invite")
    public ResponseEntity<AccountInviteResponse> inviteMember(@PathVariable UUID accountId,
                                                              @Valid @RequestBody AccountInviteRequest request,
                                                              Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received invite member request for user {} and account {}", userId, accountId);
        return ResponseEntity.status(HttpStatus.CREATED).body(accountSharingService.inviteMember(accountId, request, userId));
    }

    @PutMapping("/{accountId}/members/{memberUserId}")
    public ResponseEntity<AccountMemberResponse> updateMemberRole(@PathVariable UUID accountId,
                                                                  @PathVariable UUID memberUserId,
                                                                  @Valid @RequestBody AccountMemberRoleUpdateRequest request,
                                                                  Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received update member role request for user {} and account {}", userId, accountId);
        return ResponseEntity.ok(accountSharingService.updateMemberRole(accountId, memberUserId, request, userId));
    }

    @DeleteMapping("/{accountId}/members/{memberUserId}")
    public ResponseEntity<Void> removeMember(@PathVariable UUID accountId,
                                             @PathVariable UUID memberUserId,
                                             Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received remove member request for user {} and account {}", userId, accountId);
        accountSharingService.removeMember(accountId, memberUserId, userId);
        return ResponseEntity.noContent().build();
    }
}
