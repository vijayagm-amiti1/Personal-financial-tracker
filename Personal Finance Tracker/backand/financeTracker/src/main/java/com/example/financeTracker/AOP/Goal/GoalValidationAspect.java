package com.example.financeTracker.AOP.Goal;

import com.example.financeTracker.DTO.RequestDTO.GoalContributionRequest;
import com.example.financeTracker.DTO.RequestDTO.GoalRequest;
import com.example.financeTracker.Exception.BadRequestException;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Repository.GoalRepository;
import com.example.financeTracker.Repository.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class GoalValidationAspect {

    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final AccountRepository accountRepository;

    @Before("execution(* com.example.financeTracker.Service.GoalService.createGoal(..)) && args(request, userId)")
    public void validateCreateGoal(JoinPoint joinPoint, GoalRequest request, UUID userId) {
        validateUser(userId);
        if (request == null) {
            throw new BadRequestException("Goal request cannot be null");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("name is required");
        }
        if (request.getTargetAmount() == null || request.getTargetAmount().signum() <= 0) {
            throw new BadRequestException("targetAmount must be greater than 0");
        }
        if (request.getLinkedAccountId() == null) {
            throw new BadRequestException("linkedAccountId is required");
        }
        if (accountRepository.findByIdAndUserId(request.getLinkedAccountId(), userId).isEmpty()) {
            throw new ResourceNotFoundException("Linked account not found for this user");
        }
        if (goalRepository.findByUserIdAndNameIgnoreCase(userId, request.getName().trim()).isPresent()) {
            throw new BadRequestException("A goal with this name already exists for this user");
        }
        log.debug("Validated create goal request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }

    @Before("execution(* com.example.financeTracker.Service.GoalService.contributeToGoal(..)) && args(request, userId)")
    public void validateContributeGoal(JoinPoint joinPoint, GoalContributionRequest request, UUID userId) {
        validateUser(userId);
        if (request == null) {
            throw new BadRequestException("Goal contribution request cannot be null");
        }
        if (request.getGoalId() == null) {
            throw new BadRequestException("goalId is required");
        }
        if (request.getAccountId() == null) {
            throw new BadRequestException("accountId is required");
        }
        if (request.getAmount() == null || request.getAmount().signum() <= 0) {
            throw new BadRequestException("amount must be greater than 0");
        }
        if (goalRepository.findByIdAndUserId(request.getGoalId(), userId).isEmpty()) {
            throw new ResourceNotFoundException("Goal not found for this user");
        }
        if (accountRepository.findByIdAndUserId(request.getAccountId(), userId).isEmpty()) {
            throw new ResourceNotFoundException("Account not found for this user");
        }
        log.debug("Validated contribute goal request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }

    @Before("execution(* com.example.financeTracker.Service.GoalService.deleteGoal(..)) && args(goalId, userId)")
    public void validateDeleteGoal(JoinPoint joinPoint, UUID goalId, UUID userId) {
        validateUser(userId);
        if (goalId == null) {
            throw new BadRequestException("goalId is required");
        }
        if (goalRepository.findByIdAndUserId(goalId, userId).isEmpty()) {
            throw new ResourceNotFoundException("Goal not found for this user");
        }
        log.debug("Validated delete goal request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }

    private void validateUser(UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
    }
}
