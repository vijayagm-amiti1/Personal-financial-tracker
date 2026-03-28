package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.RequestDTO.AutomationRuleRequest;
import com.example.financeTracker.DTO.ResponseDTO.AutomationRuleResponse;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.AutomationRuleService;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
@Slf4j
public class AutomationRuleController {

    private final AutomationRuleService automationRuleService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<AutomationRuleResponse>> getRules(Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received get rules request for user {}", userId);
        return ResponseEntity.ok(automationRuleService.getRules(userId));
    }

    @PostMapping
    public ResponseEntity<AutomationRuleResponse> createRule(@Valid @RequestBody AutomationRuleRequest request,
                                                             Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received create rule request for user {}", userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(automationRuleService.createRule(request, userId));
    }

    @PutMapping("/{ruleId}")
    public ResponseEntity<AutomationRuleResponse> updateRule(@PathVariable UUID ruleId,
                                                             @Valid @RequestBody AutomationRuleRequest request,
                                                             Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received update rule request for user {} and rule {}", userId, ruleId);
        return ResponseEntity.ok(automationRuleService.updateRule(ruleId, request, userId));
    }

    @DeleteMapping("/{ruleId}")
    public ResponseEntity<Void> deleteRule(@PathVariable UUID ruleId, Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received delete rule request for user {} and rule {}", userId, ruleId);
        automationRuleService.deleteRule(ruleId, userId);
        return ResponseEntity.noContent().build();
    }
}
