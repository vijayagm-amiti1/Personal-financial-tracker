package com.example.financeTracker.AOP.Budget;

import com.example.financeTracker.DTO.RequestDTO.BudgetRequest;
import com.example.financeTracker.Exception.BadRequestException;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.BudgetRepository;
import com.example.financeTracker.Repository.CategoryRepository;
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
public class BudgetValidationAspect {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;

    @Before("(execution(* com.example.financeTracker.Service.BudgetService.createBudget(..)) && args(request, userId))"
            + " || (execution(* com.example.financeTracker.Service.BudgetService.updateBudget(..)) && args(budgetId, request, userId))")
    public void validateBudgetWriteRequest(JoinPoint joinPoint, BudgetRequest request, UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        if (request == null) {
            throw new BadRequestException("Budget request cannot be null");
        }
        if (request.getCategoryId() == null) {
            throw new BadRequestException("categoryId is required");
        }
        if (categoryRepository.findByIdAndUserId(request.getCategoryId(), userId).isEmpty()) {
            throw new ResourceNotFoundException("Category not found for this user");
        }
        if (request.getMonth() == null || request.getMonth() < 1 || request.getMonth() > 12) {
            throw new BadRequestException("month must be between 1 and 12");
        }
        if (request.getYear() == null) {
            throw new BadRequestException("year is required");
        }
        if (request.getAmount() == null || request.getAmount().signum() <= 0) {
            throw new BadRequestException("amount must be greater than 0");
        }
        if ("updateBudget".equals(joinPoint.getSignature().getName())) {
            UUID budgetId = (UUID) joinPoint.getArgs()[0];
            if (budgetId == null) {
                throw new BadRequestException("budgetId is required");
            }
            if (budgetRepository.findByIdAndUserId(budgetId, userId).isEmpty()) {
                throw new ResourceNotFoundException("Budget not found for this user");
            }
        }

        log.debug("Validated budget write request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }

    @Before("execution(* com.example.financeTracker.Service.BudgetService.getBudgetResponsesByUserId(..)) && args(userId)")
    public void validateGetBudgetsByUser(JoinPoint joinPoint, UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        log.debug("Validated get budgets request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }

    @Before("(execution(* com.example.financeTracker.Service.BudgetService.getBudgetResponseById(..)) && args(budgetId, userId))"
            + " || (execution(* com.example.financeTracker.Service.BudgetService.deleteBudget(..)) && args(budgetId, userId))")
    public void validateBudgetByIdOperations(JoinPoint joinPoint, UUID budgetId, UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (budgetId == null) {
            throw new BadRequestException("budgetId is required");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        if (budgetRepository.findByIdAndUserId(budgetId, userId).isEmpty()) {
            throw new ResourceNotFoundException("Budget not found for this user");
        }
        log.debug("Validated budget by id request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }
}
