package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.RequestDTO.GoalContributionRequest;
import com.example.financeTracker.DTO.RequestDTO.GoalRequest;
import com.example.financeTracker.DTO.ResponseDTO.GoalResponse;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.GoalService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@Slf4j
public class GoalController {

    private final GoalService goalService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<java.util.List<GoalResponse>> getGoals(Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received get goals request for user {}", userId);
        return ResponseEntity.ok(goalService.getGoalResponsesByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(@Valid @RequestBody GoalRequest request,
                                                   Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received create goal request for user {}", userId);
        GoalResponse response = goalService.createGoal(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/contribute")
    public ResponseEntity<GoalResponse> contributeToGoal(@Valid @RequestBody GoalContributionRequest request,
                                                         Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received contribute goal request for user {} and goal {}", userId, request.getGoalId());
        GoalResponse response = goalService.contributeToGoal(request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteGoal(@RequestParam UUID goalId,
                                           Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received delete goal request for user {} and goal {}", userId, goalId);
        goalService.deleteGoal(goalId, userId);
        return ResponseEntity.noContent().build();
    }
}
