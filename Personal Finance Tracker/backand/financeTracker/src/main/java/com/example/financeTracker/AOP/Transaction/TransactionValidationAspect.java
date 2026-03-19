package com.example.financeTracker.AOP.Transaction;

import com.example.financeTracker.Exception.BadRequestException;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.TransactionRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.DTO.RequestDTO.TransactionRequest;
import java.math.BigDecimal;
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
public class TransactionValidationAspect {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Before("(execution(* com.example.financeTracker.Service.TransactionService.createTransaction(..)) && args(request, userId))"
            + " || (execution(* com.example.financeTracker.Service.TransactionService.updateTransaction(..)) && args(transactionId, request, userId))")
    public void validateTransactionRequest(JoinPoint joinPoint, TransactionRequest request, UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (request == null) {
            throw new BadRequestException("Transaction request cannot be null");
        }
        if (request.getType() == null || request.getType().isBlank()) {
            throw new BadRequestException("type is required");
        }
        if (request.getDate() == null) {
            throw new BadRequestException("date is required");
        }
        if (request.getAccountId() == null) {
            throw new BadRequestException("accountId is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("amount must be greater than 0");
        }
        if ("transfer".equalsIgnoreCase(request.getType()) && request.getToAccountId() == null) {
            throw new BadRequestException("toAccountId is required when type is transfer");
        }
        if (!"transfer".equalsIgnoreCase(request.getType()) && request.getToAccountId() != null) {
            throw new BadRequestException("toAccountId is allowed only when type is transfer");
        }
        if (request.getToAccountId() != null && request.getToAccountId().equals(request.getAccountId())) {
            throw new BadRequestException("toAccountId must be different from accountId");
        }

        log.debug("Validated transaction request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }

    @Before("execution(* com.example.financeTracker.Service.TransactionService.deleteTransaction(..)) && args(transactionId, userId)")
    public void validateDeleteTransaction(JoinPoint joinPoint, UUID transactionId, UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (transactionId == null) {
            throw new BadRequestException("transactionId is required");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        if (transactionRepository.findByIdAndUserId(transactionId, userId).isEmpty()) {
            throw new ResourceNotFoundException("Transaction not found for this user");
        }

        log.debug("Validated delete transaction request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }
}
