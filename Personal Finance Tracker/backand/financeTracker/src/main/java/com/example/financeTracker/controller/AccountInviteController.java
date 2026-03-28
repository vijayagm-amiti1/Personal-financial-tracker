package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.RequestDTO.AccountInviteResponseRequest;
import com.example.financeTracker.DTO.ResponseDTO.AccountInviteResponse;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.AccountSharingService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account-invites")
@RequiredArgsConstructor
@Slf4j
public class AccountInviteController {

    private final AccountSharingService accountSharingService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/{token}")
    public ResponseEntity<AccountInviteResponse> getInviteByToken(@PathVariable String token) {
        log.info("Received get invite request for token {}", token);
        return ResponseEntity.ok(accountSharingService.getInviteByToken(token));
    }

    @PostMapping("/{token}/respond")
    public ResponseEntity<AccountInviteResponse> respondToInvite(@PathVariable String token,
                                                                 @Valid @RequestBody AccountInviteResponseRequest request,
                                                                 Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received invite response for token {} by user {}", token, userId);
        return ResponseEntity.ok(accountSharingService.respondToInvite(token, userId, Boolean.TRUE.equals(request.getAccepted())));
    }
}
