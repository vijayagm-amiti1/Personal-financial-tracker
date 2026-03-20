package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.RequestDTO.UserSettingsUpdateRequest;
import com.example.financeTracker.DTO.ResponseDTO.UserSettingsResponse;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.UserSettingsService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Slf4j
public class UserSettingsController {

    private final UserSettingsService userSettingsService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<UserSettingsResponse> getSettings(Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received get settings request for user {}", userId);
        return ResponseEntity.ok(userSettingsService.getSettingsByUserId(userId));
    }

    @PutMapping
    public ResponseEntity<UserSettingsResponse> updateSettings(@Valid @RequestBody UserSettingsUpdateRequest request,
                                                               Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received update settings request for user {}", userId);
        return ResponseEntity.ok(userSettingsService.updateSettings(userId, request));
    }
}
